import { useCallback } from "react";
import { isPropertiesArray } from "@/interfaces/metadata";
import { useDataContextManagerActions } from "@/providers/dataContextManager";
import { IObjectMetadataBuilder, MetadataBuilderAction } from "../metadataBuilder";

export const useContextsRegistration = (): MetadataBuilderAction => {
  const { getDataContexts } = useDataContextManagerActions();

  const action = useCallback((builder: IObjectMetadataBuilder) => {
    const contexts = getDataContexts();
    if (contexts.length) {
      builder.addObject('contexts', "Contexts", (builder) => {
        for (const context of contexts)
          if (context.metadata && (context.metadata.properties?.length || context.metadata.methods?.length || context.metadata.typeDefinitionLoader)) {
            builder.addObject(context.name, context.description, (builder) => {
              if (context.metadata.typeDefinitionLoader)
                builder.setTypeDefinition(context.metadata.typeDefinitionLoader);
              if (isPropertiesArray(context.metadata.properties))
                builder.setProperties(context.metadata.properties);
              if (context.metadata.methods && Array.isArray(context.metadata.methods))
                builder.setMethods(context.metadata.methods);
              return builder;
            });
          } else {
            builder.addObject(context.name, context.description, (builder) => {
              builder.addAny('[key: string]', 'fields');
            });
          }
        return builder;
      });
    }
  }, []);

  return action;
};
