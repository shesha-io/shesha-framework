import { useEffect } from "react";
import { DocumentDefinition } from "../models";
import { useConfigurationStudioEnvironment } from "./contexts";

export const useConfigurationStudioDocumentDefinitions = (definitions: DocumentDefinition[]): void => {
  const cs = useConfigurationStudioEnvironment();

  useEffect(() => {
    definitions.forEach((definition) => {
      cs.registerDocumentDefinition(definition);
    });

    return (): void => {
      definitions.forEach((definition) => {
        cs.unregisterDocumentDefinition(definition);
      });
    };
  }, [cs, definitions]);
};
