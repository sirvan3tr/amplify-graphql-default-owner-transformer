import {
  DirectiveWrapper,
  InvalidDirectiveError,
  MappingTemplate,
  TransformerPluginBase,
  InputObjectDefinitionWrapper,
} from '@aws-amplify/graphql-transformer-core';
import {
  TransformerContextProvider,
  TransformerSchemaVisitStepContextProvider,
  TransformerTransformSchemaStepContextProvider,
} from '@aws-amplify/graphql-transformer-interfaces';
import {
  DirectiveNode,
  FieldDefinitionNode,
  InterfaceTypeDefinitionNode,
  ObjectTypeDefinitionNode,
} from 'graphql';
import {
  Expression,
  compoundExpression,
  set,
  methodCall,
  printBlock,
  qref,
  ref,
  str,
} from 'graphql-mapping-template';
import {NONE_VALUE, ModelResourceIDs} from 'graphql-transformer-common';

type DefaultValueDirectiveConfiguration = {
  object: ObjectTypeDefinitionNode;
  field: FieldDefinitionNode;
  directive: DirectiveNode;
  modelDirective: DirectiveNode;
  value: string;
};

const directiveName = 'owner';
const directiveDefinition = `
  directive @${directiveName}(value: String) on FIELD_DEFINITION
`;

export const DEFAULT_COGNITO_IDENTITY_CLAIM = 'cognito:username';

const getIdentityClaimExp = (
  value: Expression,
  defaultValueExp: Expression
): Expression => {
  return methodCall(
    ref('util.defaultIfNull'),
    methodCall(ref('ctx.identity.claims.get'), value),
    defaultValueExp
  );
};

const getOwnerClaim = (ownerClaim: string): Expression => {
  if (ownerClaim === 'username') {
    return getIdentityClaimExp(
      str(ownerClaim),
      getIdentityClaimExp(str(DEFAULT_COGNITO_IDENTITY_CLAIM), str(NONE_VALUE))
    );
  }
  return getIdentityClaimExp(str(ownerClaim), str(NONE_VALUE));
};

const idx = 0;
const claim = 'username';

/**
 * Handles the @owner directive on FIELD types.
 */
export class DefaultOwnerTransformer extends TransformerPluginBase {
  private directiveMap = new Map<string, DefaultValueDirectiveConfiguration[]>();

  constructor() {
    super('graphql-default-owner-transformer', directiveDefinition);
  }

  field = (
    parent: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode,
    definition: FieldDefinitionNode,
    directive: DirectiveNode,
    ctx: TransformerSchemaVisitStepContextProvider
  ): void => {
    const directiveWrapped = new DirectiveWrapper(directive);
    const config = directiveWrapped.getArguments({
      object: parent as ObjectTypeDefinitionNode,
      field: definition,
      directive,
    } as DefaultValueDirectiveConfiguration);
    validate(ctx, config);

    if (!this.directiveMap.has(parent.name.value)) {
      this.directiveMap.set(parent.name.value, []);
    }

    this.directiveMap.get(parent.name.value)!.push(config);
  };

  transformSchema = (ctx: TransformerTransformSchemaStepContextProvider) => {
    for (const typeName of this.directiveMap.keys()) {
      const name = ModelResourceIDs.ModelCreateInputObjectName(typeName);
      for (const config of this.directiveMap.get(typeName)!) {
        const input = InputObjectDefinitionWrapper.fromObject(
          name,
          config.object,
          ctx.inputDocument
        );
        const fieldWrapper = input.fields.find(
          f => f.name === config.field.name.value
        );
        fieldWrapper?.makeNullable();
      }
    }
  };

  generateResolvers = (ctx: TransformerContextProvider): void => {
    const context = ctx as TransformerContextProvider;

    for (const typeName of this.directiveMap.keys()) {
      const snippets: string[] = [];
      for (const config of this.directiveMap.get(typeName)!) {
        const fieldName = config.field.name.value;
        snippets.push(this.makeDefaultValueSnippet(fieldName));
      }

      this.updateResolverWithDefaultValues(
        context,
        `create${typeName}`,
        snippets
      );
    }
  };

  private makeDefaultValueSnippet = (fieldName: string): string => {
    // Example of output:
    // #set( $ownerClaim0 = $util.defaultIfNull(
    //   $ctx.identity.claims.get("username"),
    //   $util.defaultIfNull(
    //     $ctx.identity.claims.get("cognito:username"),
    //     "___xamznone____")))
    // $util.qr($ctx.args.input.put("owner", $ownerClaim0))
    return printBlock('Setting ${fieldName} to be the default owner')(
      compoundExpression([
        set(ref(`ownerClaim${idx}`), getOwnerClaim(claim)),
        qref(
          methodCall(
            ref('ctx.args.input.put'),
            str(fieldName),
            ref(`ownerClaim${idx}`)
          )
        ),
      ])
    );
  };

  private updateResolverWithDefaultValues = (
    ctx: TransformerContextProvider,
    resolverLogicalId: string,
    snippets: string[]
  ): void => {
    // Get the resolver object
    const objectName = ctx.output.getMutationTypeName();
    const resolver = objectName ? ctx.resolvers.getResolver(objectName, resolverLogicalId) : null;

    if (resolver) {
      // Add snippet to resolver slot
      const res = resolver as any;
      res.addToSlot(
        'init',
        MappingTemplate.s3MappingTemplateFromString(
          snippets.join('\n') + '\n{}',
          `${res.typeName}.${res.fieldName}.{slotName}.{slotIndex}.req.vtl`
        )
      );
    }
  };
}

function validate(
  ctx: TransformerSchemaVisitStepContextProvider,
  config: DefaultValueDirectiveConfiguration
): void {
  validateModelDirective(config);
  // Keeping this function here for other potential validations in the future.
}

function validateModelDirective(
  config: DefaultValueDirectiveConfiguration
): void {
  const modelDirective = config.object.directives!.find(
    dir => dir.name.value === 'model'
  );
  if (!modelDirective) {
    throw new InvalidDirectiveError(`
      The @${directiveName} directive may only be added to object
      definitions annotated with @model.
    `);
  }
}
