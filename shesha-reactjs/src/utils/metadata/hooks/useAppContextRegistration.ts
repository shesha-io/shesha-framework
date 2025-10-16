import { useCallback } from "react";
import { isPropertiesArray } from "@/interfaces/metadata";
import { SheshaCommonContexts } from "@/providers/dataContextManager/models";
import { useDataContextManagerActions } from "@/providers/dataContextManager";
import { IObjectMetadataBuilder, MetadataBuilderAction } from "../metadataBuilder";

export const useAppContextRegistration = (): MetadataBuilderAction => {
  const { getDataContext } = useDataContextManagerActions();

  const action = useCallback((builder: IObjectMetadataBuilder) => {
    const appContext = getDataContext(SheshaCommonContexts.ApplicationContext);
    if (appContext?.metadata) {
      builder.addObject(SheshaCommonContexts.ApplicationContext, "", (builder) => {
        if (isPropertiesArray(appContext.metadata.properties))
          builder.setProperties(appContext.metadata.properties);
        return builder;
      });
    }
  }, []);

  return action;
};
