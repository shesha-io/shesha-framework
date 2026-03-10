import { useState } from "react";
import { IPropertyMetadata } from "@/interfaces/metadata";
import { SheshaCommonContexts } from "@/providers/dataContextManager/models";
import { useDataContextManagerActions } from "@/providers/dataContextManager";

export const useGlobalConstants = (): IPropertyMetadata[] => {
  const { getDataContext } = useDataContextManagerActions();

  const [constants] = useState<IPropertyMetadata[]>(() => {
    const result: IPropertyMetadata[] = [];
    const appContext = getDataContext(SheshaCommonContexts.ApplicationContext);
    if (appContext?.metadata)
      result.push({ ...appContext.metadata, path: SheshaCommonContexts.ApplicationContext });

    return result;
  });

  return constants;
};
