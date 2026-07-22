import { DocumentDefinition } from "../models";

export interface IConfigurationStudioEnvironment {
  /**
   * Register a document definition.
   */
  registerDocumentDefinition: (definition: DocumentDefinition) => void;
  /**
   * Unregister docuement definition
   */
  unregisterDocumentDefinition: (definition: DocumentDefinition) => void;

  /**
   * Get document definition by item type
   */
  getDocumentDefinition: (itemType: string) => DocumentDefinition | undefined;
}
