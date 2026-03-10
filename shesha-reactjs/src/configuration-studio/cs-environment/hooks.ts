import { useEffect } from "react";
import { DocumentDefinition } from "../models";
import { useConfigurationStudioEnvironment } from "./contexts";

export const useConfigurationStudioDocumentDefinitions = (definitions: DocumentDefinition[]): void => {
  const csEnv = useConfigurationStudioEnvironment();

  useEffect(() => {
    definitions.forEach((definition) => {
      csEnv.registerDocumentDefinition(definition);
    });

    return (): void => {
      definitions.forEach((definition) => {
        csEnv.unregisterDocumentDefinition(definition);
      });
    };
  }, [csEnv, definitions]);
};
