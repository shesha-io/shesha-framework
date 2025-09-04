import qs from "qs";
import { HttpClientApi } from "@/publicJsApis/httpClient";
import { FormsManager } from "./manager";
import { AxiosResponse } from "axios";
import { IAbpWrappedGetEntityResponse } from "@/interfaces/gql";
import { FormConfigurationDto } from "@/providers/form/api";
import { evaluateString } from "@/providers/form/utils";
import { nanoid } from "@/utils/uuid";
import { GenerationLogicFactory } from "./generation-logic/factory";
import { EntityMetadataHelper } from "./generation-logic/entityMetadataHelper";
import { MetadataDispatcher } from "@/providers/metadataDispatcher/dispatcher";
import { EntityMetadataFetcher } from "@/providers/metadataDispatcher/entities/entityMetadataFetcher";
import { ICache, ICacheProvider } from "@/providers/metadataDispatcher/entities/models";
import localForage from "localforage";

export interface IFormsApi {
  /**
   * Prepare form markup using form template
   * 
   * Uses reflection to instantiate the appropriate GenerationLogic implementation
   * based on the template type. Different templates (like DetailsViewGenerationLogic 
   * or TableViewGenerationLogic) will have specialized processing for adding
   * components based on the modelType and other replacements.
   * 
   * @param templateId The ID of the form template to use
   * @param replacements An object with properties to replace in the template, including modelType
   * @returns Promise resolving to the processed markup string
   */
  prepareTemplateAsync: (templateId: string, replacements: object) => Promise<string>;
}

/**
 * Forms API.
 */
export class FormsApi implements IFormsApi {
  readonly _formsManager: FormsManager;
  readonly _httpClient: HttpClientApi;

  readonly _generationLogicFactory: GenerationLogicFactory;
  readonly _entityMetadataHelper: EntityMetadataHelper;

  constructor(httpClient: HttpClientApi) {
    this._formsManager = new FormsManager(httpClient);
    this._httpClient = httpClient;
    this._generationLogicFactory = new GenerationLogicFactory();
    
    // Create a simple cache provider implementation
    const cacheProvider: ICacheProvider = {
      getCache: (name: string): ICache => {
        return localForage.createInstance({ name: name });
      }
    };
    
    const entityMetadataFetcher = new EntityMetadataFetcher(httpClient, cacheProvider);
    const metadataDispatcher = new MetadataDispatcher(entityMetadataFetcher, httpClient);
    
    this._entityMetadataHelper = new EntityMetadataHelper(metadataDispatcher);
  }

  
  prepareTemplateAsync = (templateId: string, replacements: object): Promise<string> => {
    if (!templateId)
      return Promise.resolve(null);

    const payload = {
      id: templateId,
    };

    const url = `/api/dynamic/Shesha/FormConfigurationRevision/Crud/Get?${qs.stringify(payload)}`;
    return this._httpClient
      .get<any, AxiosResponse<IAbpWrappedGetEntityResponse<FormConfigurationDto>>>(url)
      .then(async (response) => {
        const template = response.data.result;
        const markup = template.markup;

        const enhancedReplacements = {
          NEW_KEY: nanoid(),
          GEN_KEY: nanoid(),
          ...(replacements ?? {}),
        };

         try {
          if (!markup) {
            throw new Error('Markup parameter is required');
          }
          if (!replacements) {
            throw new Error('Replacements parameter is required');
          }
          // Determine the correct generation logic for this template
          const generationLogic = this._generationLogicFactory.getGenerationLogic(template);

          // Process the template using the appropriate generation logic
          const preparedMarkup = await generationLogic.processTemplate(
            markup, 
            replacements,
            this._entityMetadataHelper
          );
          return preparedMarkup;
        } catch (error) {
          console.error('Error preparing template markup:', error);
          
          // In case of error, fall back to basic string replacement
          return evaluateString(markup, enhancedReplacements, true);
        }
      });
  };
}
