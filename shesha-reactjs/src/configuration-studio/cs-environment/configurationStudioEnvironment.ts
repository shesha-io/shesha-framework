import { getUnknownDocumentDefinition } from "../document-definitions/configurable-editor/genericDefinition";
import { DocumentDefinition, DocumentDefinitions } from "../models";
import { IConfigurationStudioEnvironment } from "./interfaces";

export class ConfigurationStudioEnvironment implements IConfigurationStudioEnvironment {
  private _documentDefinitions: DocumentDefinitions;

  constructor() {
    this._documentDefinitions = new Map<string, DocumentDefinition>();
  }

  registerDocumentDefinition = (definition: DocumentDefinition): void => {
    this._documentDefinitions.set(definition.documentType, definition);
  };

  unregisterDocumentDefinition = (definition: DocumentDefinition): void => {
    this._documentDefinitions.delete(definition.documentType);
  };

  getDocumentDefinition = (itemType: string): DocumentDefinition | undefined => {
    const definition = this._documentDefinitions.get(itemType);
    return definition ?? getUnknownDocumentDefinition(itemType);
  };
}
