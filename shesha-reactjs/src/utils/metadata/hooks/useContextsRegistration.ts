import { useCallback } from "react";
import { isPropertiesArray } from "@/interfaces/metadata";
import { useDataContextManagerActions } from "@/providers/dataContextManager/hooks";
import { IObjectMetadataBuilder, MetadataBuilderAction } from "../metadataBuilder";
import { isDefined } from "@/utils/nullables";
import { IDataContextDescriptor } from "@/providers/dataContextManager/models";

export const useContextsRegistration = (): MetadataBuilderAction => {
  const { getDataContexts } = useDataContextManagerActions();

  const action = useCallback((builder: IObjectMetadataBuilder) => {
    const contexts = getDataContexts();
    if (contexts.length) {
      builder.addObject('contexts', "Contexts @deprecated use (application.context, page.context or form.context) instead. This item is outdated and will be removed in further versions.", (builder) => {
        for (const context of contexts) {
          getContextWithProperties(builder, context);
        }
        return builder;
      });
    }
  }, [getDataContexts]);

  return action;
};

export const getContextWithProperties = (builder: IObjectMetadataBuilder, context: IDataContextDescriptor): void => {
  const meta = context.metadata;
  if (isDefined(meta) && (meta.properties?.length || meta.methods?.length || meta.typeDefinitionLoader)) {
    builder.addObject(context.name, context.description, (builder) => {
      if (meta.typeDefinitionLoader)
        builder.setTypeDefinition(meta.typeDefinitionLoader);
      if (isPropertiesArray(meta.properties))
        builder.setProperties(meta.properties);
      if (meta.methods && Array.isArray(meta.methods))
        builder.setMethods(meta.methods);
      return builder;
    });
  } else {
    builder.addObject(context.name, context.description, (builder) => {
      builder.addAny('[key: string]', 'fields');
    });
  }
};
