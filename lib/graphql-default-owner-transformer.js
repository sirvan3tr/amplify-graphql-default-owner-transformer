"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultOwnerTransformer = exports.DEFAULT_COGNITO_IDENTITY_CLAIM = void 0;
const graphql_transformer_core_1 = require("@aws-amplify/graphql-transformer-core");
const graphql_mapping_template_1 = require("graphql-mapping-template");
const graphql_transformer_common_1 = require("graphql-transformer-common");
const directiveName = 'owner';
const directiveDefinition = `
  directive @${directiveName}(value: String) on FIELD_DEFINITION
`;
exports.DEFAULT_COGNITO_IDENTITY_CLAIM = 'cognito:username';
const getIdentityClaimExp = (value, defaultValueExp) => {
    return (0, graphql_mapping_template_1.methodCall)((0, graphql_mapping_template_1.ref)('util.defaultIfNull'), (0, graphql_mapping_template_1.methodCall)((0, graphql_mapping_template_1.ref)('ctx.identity.claims.get'), value), defaultValueExp);
};
const getOwnerClaim = (ownerClaim) => {
    if (ownerClaim === 'username') {
        return getIdentityClaimExp((0, graphql_mapping_template_1.str)(ownerClaim), getIdentityClaimExp((0, graphql_mapping_template_1.str)(exports.DEFAULT_COGNITO_IDENTITY_CLAIM), (0, graphql_mapping_template_1.str)(graphql_transformer_common_1.NONE_VALUE)));
    }
    return getIdentityClaimExp((0, graphql_mapping_template_1.str)(ownerClaim), (0, graphql_mapping_template_1.str)(graphql_transformer_common_1.NONE_VALUE));
};
const idx = 0;
const claim = 'username';
class DefaultOwnerTransformer extends graphql_transformer_core_1.TransformerPluginBase {
    constructor() {
        super(`graphql-default-owner-transformer`, directiveDefinition);
        this.directiveMap = new Map();
        this.field = (parent, definition, directive, ctx) => {
            const directiveWrapped = new graphql_transformer_core_1.DirectiveWrapper(directive);
            const config = directiveWrapped.getArguments({
                object: parent,
                field: definition,
                directive,
            });
            validate(ctx, config);
            if (!this.directiveMap.has(parent.name.value)) {
                this.directiveMap.set(parent.name.value, []);
            }
            this.directiveMap.get(parent.name.value).push(config);
        };
        this.transformSchema = (ctx) => {
            for (const typeName of this.directiveMap.keys()) {
                const name = graphql_transformer_common_1.ModelResourceIDs.ModelCreateInputObjectName(typeName);
                for (const config of this.directiveMap.get(typeName)) {
                    const input = graphql_transformer_core_1.InputObjectDefinitionWrapper.fromObject(name, config.object, ctx.inputDocument);
                    const fieldWrapper = input.fields.find(f => f.name === config.field.name.value);
                    fieldWrapper === null || fieldWrapper === void 0 ? void 0 : fieldWrapper.makeNullable();
                }
            }
        };
        this.generateResolvers = (ctx) => {
            const context = ctx;
            for (const typeName of this.directiveMap.keys()) {
                const snippets = [];
                for (const config of this.directiveMap.get(typeName)) {
                    const fieldName = config.field.name.value;
                    snippets.push(this.makeDefaultValueSnippet(fieldName));
                }
                this.updateResolverWithDefaultValues(context, `create${typeName}`, snippets);
            }
        };
        this.makeDefaultValueSnippet = (fieldName) => {
            return (0, graphql_mapping_template_1.printBlock)('Setting ${fieldName} to be the default owner')((0, graphql_mapping_template_1.compoundExpression)([
                (0, graphql_mapping_template_1.set)((0, graphql_mapping_template_1.ref)(`ownerClaim${idx}`), getOwnerClaim(claim)),
                (0, graphql_mapping_template_1.qref)((0, graphql_mapping_template_1.methodCall)((0, graphql_mapping_template_1.ref)('ctx.args.input.put'), (0, graphql_mapping_template_1.str)(fieldName), (0, graphql_mapping_template_1.ref)(`ownerClaim${idx}`)))
            ]));
        };
        this.updateResolverWithDefaultValues = (ctx, resolverLogicalId, snippets) => {
            const objectName = ctx.output.getMutationTypeName();
            const resolver = objectName ? ctx.resolvers.getResolver(objectName, resolverLogicalId) : null;
            if (resolver) {
                const res = resolver;
                res.addToSlot('init', graphql_transformer_core_1.MappingTemplate.s3MappingTemplateFromString(snippets.join('\n') + '\n{}', `${res.typeName}.${res.fieldName}.{slotName}.{slotIndex}.req.vtl`));
            }
        };
    }
}
exports.DefaultOwnerTransformer = DefaultOwnerTransformer;
function validate(ctx, config) {
    validateModelDirective(config);
}
function validateModelDirective(config) {
    const modelDirective = config.object.directives.find(dir => dir.name.value === 'model');
    if (!modelDirective) {
        throw new graphql_transformer_core_1.InvalidDirectiveError('The @${directive} directive may only be added to object definitions annotated with @model.');
    }
}
//# sourceMappingURL=graphql-default-owner-transformer.js.map