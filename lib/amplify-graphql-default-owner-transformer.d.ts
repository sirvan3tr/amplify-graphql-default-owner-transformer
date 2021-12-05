import { TransformerPluginBase } from '@aws-amplify/graphql-transformer-core';
import { TransformerContextProvider, TransformerSchemaVisitStepContextProvider, TransformerTransformSchemaStepContextProvider } from '@aws-amplify/graphql-transformer-interfaces';
import { DirectiveNode, FieldDefinitionNode, InterfaceTypeDefinitionNode, ObjectTypeDefinitionNode } from 'graphql';
/**
 * Handles the @owner directive on FIELD types.
 */
export declare class DefaultOwnerTransformer extends TransformerPluginBase {
    private directiveMap;
    constructor();
    field: (parent: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode, definition: FieldDefinitionNode, directive: DirectiveNode, ctx: TransformerSchemaVisitStepContextProvider) => void;
    transformSchema: (ctx: TransformerTransformSchemaStepContextProvider) => void;
    generateResolvers: (ctx: TransformerContextProvider) => void;
    private makeDefaultValueSnippet;
    private updateResolverWithDefaultValues;
}
