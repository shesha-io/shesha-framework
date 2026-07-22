import { useCallback } from "react";
import { IPropertyMetadata, isPropertiesArray, isPropertiesLoader } from "@/interfaces/metadata";
import { SheshaCommonContexts } from "@/providers/dataContextManager/models";
import { useDataContextManagerActions } from "@/providers/dataContextManager/hooks";
import { IObjectMetadataBuilder, MetadataBuilderAction } from "../metadataBuilder";

export const useAppContextRegistration = (): MetadataBuilderAction => {
  const { getDataContext } = useDataContextManagerActions();

  return useCallback((builder: IObjectMetadataBuilder) => {
    const appContext = getDataContext(SheshaCommonContexts.ApplicationContext);
    const metadata = appContext?.metadata;
    if (metadata && isPropertiesArray(metadata.properties)) {
      // Strip lazy-loaded properties (e.g. entities, settings) to prevent HTTP fetches
      // when the expression editor builds its autocomplete context.
      const safeProperties = metadata.properties.map((prop): IPropertyMetadata => {
        if (!isPropertiesLoader(prop.properties)) return prop;
        const safe: IPropertyMetadata = { ...prop, properties: undefined };
        Reflect.deleteProperty(safe, 'typeDefinitionLoader');
        return safe;
      });
      builder.addObject(SheshaCommonContexts.ApplicationContext, "", (b) => {
        b.setProperties(safeProperties);
        return b;
      });
    }
  }, [getDataContext]);
};
