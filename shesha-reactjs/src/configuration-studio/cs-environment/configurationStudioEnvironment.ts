import { HttpClientApi } from "@/providers";
import { fetchFrontEndAppsMapAsync } from "../apis";
import { getUnknownDocumentDefinition } from "../document-definitions/configurable-editor/genericDefinition";
import { DocumentDefinition, DocumentDefinitions, FrontEndAppDto } from "../models";
import { IConfigurationStudioEnvironment } from "./interfaces";
interface ConfigurationStudioEnvironmentArguments {
  httpClient: HttpClientApi;
}

export class ConfigurationStudioEnvironment implements IConfigurationStudioEnvironment {
  private _documentDefinitions: DocumentDefinitions;

  httpClient: HttpClientApi;

  constructor(args: ConfigurationStudioEnvironmentArguments) {
    this._documentDefinitions = new Map<string, DocumentDefinition>();
    this.httpClient = args.httpClient;
  }

  private _frontEndAppsPromise: Promise<Map<string, FrontEndAppDto>> | undefined = undefined;

  getFrontEndAppsMapAsync = (): Promise<Map<string, FrontEndAppDto>> => {
    return this._frontEndAppsPromise ??= fetchFrontEndAppsMapAsync(this.httpClient);
  };

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
