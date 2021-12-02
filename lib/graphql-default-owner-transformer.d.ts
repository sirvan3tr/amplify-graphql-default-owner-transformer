import { TransformerPluginBase } from '@aws-amplify/graphql-transformer-core';
import { TransformerContextProvider, TransformerSchemaVisitStepContextProvider, TransformerTransformSchemaStepContextProvider } from '@aws-amplify/graphql-transformer-interfaces';
import { DirectiveNode, FieldDefinitionNode, InterfaceTypeDefinitionNode, ObjectTypeDefinitionNode } from 'graphql';
export declare const DEFAULT_COGNITO_IDENTITY_CLAIM = "cognito:username";
export declare class DefaultOwnerTransformer extends TransformerPluginBase {
    private directiveMap;
    constructor();
    field: (parent: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode, definition: FieldDefinitionNode, directive: DirectiveNode, ctx: TransformerSchemaVisitStepContextProvider) => void;
    transformSchema: (ctx: TransformerTransformSchemaStepContextProvider) => void;
    generateResolvers: (ctx: TransformerContextProvider) => void;
    private makeDefaultValueSnippet;
    private updateResolverWithDefaultValues;
}
//# sourceMappingURL=graphql-default-owner-transformer.d.ts.map