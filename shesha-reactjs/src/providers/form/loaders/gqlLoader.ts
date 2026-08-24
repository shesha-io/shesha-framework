import { asPropertiesArray, IApiEndpoint, IModelMetadata, isApiEndpoint, isPropertiesArray, StandardEntityActions } from "@/interfaces/metadata";
import { GetGqlFieldsPayload, IFieldData, IFormDataLoader, GetFormFieldsPayload, FormDataLoadingPayload, isGqlLoaderSettings, GqlLoaderSettings } from "./interfaces";
import { configurableItemIdentifierToString, DataTypes, extractAjaxResponse, IAjaxResponse, IAnyObject, IGetFieldsToFetchContext, IToolboxComponents } from "@/interfaces";
import { IConfigurationLoader } from "@/providers/configurationItemsLoader/configurationLoader";
import { useConfigurationItemsLoader } from "@/providers/configurationItemsLoader";
import { componentsTreeToFlatStructure, upgradeComponents } from "../utils";
import { DEFAULT_FORM_SETTINGS, FormIdentifier } from "../models";
import { HttpClientApi, useHttpClient } from "@/providers/sheshaApplication/publicApi";
import { IMetadataDispatcher } from "@/providers/metadataDispatcher/contexts";
import { IEntityEndpointsEvaluator, useModelApiHelper } from "@/components/configurableForm/useActionEndpoint";
import { gqlFieldsToString } from "../api";
import { constructUrl } from "@/utils/fetchers";
import { useState } from "react";
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { IFormSettings, isConfigurableFormComponent, useMetadataDispatcher } from "@/providers";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { getIdOrUndefined } from "@/utils/entity";
import { extractErrorInfo } from "@/utils/errors";

export interface GqlLoaderArguments {
  httpClient: HttpClientApi;
  metadataDispatcher: IMetadataDispatcher;
  toolboxComponents: IToolboxComponents;
  endpointsEvaluator: IEntityEndpointsEvaluator;
  configurationLoader: IConfigurationLoader;
}

// register loader factory and accept only form-specific parameters

export class GqlLoader<Values extends object = object> implements IFormDataLoader<Values> {
  #httpClient: HttpClientApi;

  #metadataDispatcher: IMetadataDispatcher;

  #toolboxComponents: IToolboxComponents;

  #endpointsEvaluator: IEntityEndpointsEvaluator;

  #configurationLoader: IConfigurationLoader;

  constructor(args: GqlLoaderArguments) {
    this.#httpClient = args.httpClient;
    this.#metadataDispatcher = args.metadataDispatcher;
    this.#toolboxComponents = args.toolboxComponents;
    this.#endpointsEvaluator = args.endpointsEvaluator;
    this.#configurationLoader = args.configurationLoader;
  }

  canLoadData = (formArguments: object | undefined): boolean => {
    return isDefined(formArguments) && "id" in formArguments && isDefined(formArguments.id);
  };

  #getGqlSettings = (formSettings: IFormSettings): GqlLoaderSettings => {
    const { dataLoadersSettings = {} } = formSettings;
    const loaderSettings = dataLoadersSettings['gql'];
    return isGqlLoaderSettings(loaderSettings) ? loaderSettings : { endpointType: 'default' };
  };

  getEndpointAsync = async (payload: FormDataLoadingPayload): Promise<IApiEndpoint | undefined> => {
    const { formSettings } = payload;
    const gqlSettings = this.#getGqlSettings(formSettings);
    const { endpointType, staticEndpoint, dynamicEndpoint } = gqlSettings;

    switch (endpointType) {
      case 'default': {
        return await this.#endpointsEvaluator.getFormActionUrl({ actionName: StandardEntityActions.read, formSettings: formSettings, mappings: [] });
      }
      case 'static': {
        return staticEndpoint
          ? { ...staticEndpoint, httpVerb: staticEndpoint.httpVerb || 'get' }
          : undefined;
      }
      case 'dynamic': {
        if (isNullOrWhiteSpace(dynamicEndpoint))
          return undefined;
        const dynamicEvaluated = await payload.expressionExecuter(dynamicEndpoint, { });
        return isApiEndpoint(dynamicEvaluated) ? dynamicEvaluated : undefined;
      }
      default:
        return undefined;
    }
  };

  #missingDataIdError = (payload: FormDataLoadingPayload, endpointUrl: string): Error => {
    const { formSettings, formArguments } = payload;
    const { modelType } = formSettings;
    const modelTypeName = typeof modelType === 'string' ? modelType : modelType?.name;

    const argumentNames = isDefined(formArguments) ? Object.keys(formArguments) : [];
    const receivedArguments = argumentNames.length > 0
      ? `received form arguments: ${argumentNames.join(', ')}`
      : 'no form arguments were passed';

    return new Error(
      `Data id is missing: the form loads data by id${isNullOrWhiteSpace(modelTypeName) ? '' : ` from '${modelTypeName}'`} using '${endpointUrl}', but no 'id' was found in the form arguments (${receivedArguments}).`,
    );
  };

  loadAsync = async (payload: FormDataLoadingPayload): Promise<Values | undefined> => {
    const { loadingCallback, formSettings, formArguments, formFlatStructure } = payload;
    const dataId = getIdOrUndefined(formArguments);
    try {
      const endpoint = await this.getEndpointAsync(payload);

      // TODO: implement data loading using different http verbs
      const getDataUrl = endpoint && endpoint.httpVerb.toLowerCase() === 'get' // note: support get only here
        ? endpoint.url
        : null;
      if (isNullOrWhiteSpace(getDataUrl))
        throw new Error('Data loading endpoint is missing');

      loadingCallback?.({ loadingState: 'loading', loaderHint: 'Fetching metadata...' });
      const gqlFieldsList = await this.#getFieldsToFetchAsync({
        formSettings: formSettings,
        formFlatStructure: formFlatStructure,
      });
      var gqlFields = gqlFieldsToString(gqlFieldsList);

      const queryParams: IAnyObject = { properties: gqlFields };
      if (dataId) queryParams['id'] = dataId;
      const finalUrl = constructUrl(undefined, getDataUrl, queryParams);

      loadingCallback?.({ loadingState: 'loading', loaderHint: 'Fetching data...' });

      const response = await this.#httpClient.get<IAjaxResponse<Values>>(finalUrl);

      const responseData = extractAjaxResponse(response.data, 'Failed to load data');

      // note: checked after the request so that more specific failures (endpoint, server, permissions) surface first
      if (!dataId)
        throw this.#missingDataIdError(payload, getDataUrl);

      loadingCallback?.({ loadingState: 'ready', loaderHint: undefined });

      return responseData;
    } catch (error) {
      loadingCallback?.({ loadingState: 'failed', error: extractErrorInfo(error) });
      return undefined;
    }
  };

  #getFieldsFromCustomEvents = (code: string | undefined): string[] => {
    if (isNullOrWhiteSpace(code))
      return [];
    const reg = new RegExp('(?<![_a-zA-Z0-9.])data.[_a-zA-Z0-9.]+', 'g');
    const matchAll = code.matchAll(reg);
    const match = Array.from(matchAll);
    return match.map((item) => item[0].replace('data.', ''));
  };

  /**
   * Returns fields of the form with the specified identifier, relative to the root of that form.
   * `visitedForms` protects from the infinite recursion on the forms referencing each other
   */
  #getNestedFormFieldsAsync = async (formId: FormIdentifier, visitedForms: Set<string>): Promise<string[]> => {
    const formKey = configurableItemIdentifierToString(formId);
    if (visitedForms.has(formKey))
      return [];

    const form = await this.#configurationLoader.getFormAsync({ formId, skipCache: false });
    const formSettings = form.settings ?? DEFAULT_FORM_SETTINGS;

    const flatStructure = componentsTreeToFlatStructure(this.#toolboxComponents, form.markup ?? []);
    upgradeComponents(this.#toolboxComponents, formSettings, flatStructure);

    const metadata = isDefined(formSettings.modelType)
      ? await this.#metadataDispatcher.getMetadata({ dataType: DataTypes.entityReference, modelType: formSettings.modelType }) ?? undefined
      : undefined;

    return await this.#getFormFieldsAsync(
      { formFlatStructure: flatStructure, formSettings: formSettings },
      metadata,
      new Set(visitedForms).add(formKey),
    );
  };

  #getFormFieldsAsync = async (payload: GetFormFieldsPayload, metadata: IModelMetadata | undefined, visitedForms: Set<string>): Promise<string[]> => {
    const { formFlatStructure, formSettings } = payload;

    const gqlSettings = this.#getGqlSettings(formSettings);

    const toolboxComponents = this.#toolboxComponents;

    const fieldsContext: IGetFieldsToFetchContext = {
      getFormFieldsAsync: (formId) => this.#getNestedFormFieldsAsync(formId, visitedForms),
      getEntityFormIdAsync: (entityType, formType) => this.#configurationLoader.getEntityFormIdAsync(entityType, formType),
    };

    const { allComponents: components } = formFlatStructure;
    let fieldNames: string[] = [];
    const asyncFieldNames: Promise<string[]>[] = [];
    for (const key in components) {
      if (components.hasOwnProperty(key) && isConfigurableFormComponent(components[key])) {
        var model = components[key];
        var component = toolboxComponents[model.type];

        // get data only for isInput components
        // and for context = null or empty string (form context)
        if (component && (component.isInput || component.isOutput) && !model.context) {
          const propName = model.propertyName;

          // TODO: AS - calc actual propName from JS setting
          if (typeof propName === 'string') {
            const asyncFieldsFunc = component.getFieldsToFetchAsync;
            const fieldsFunc = component.getFieldsToFetch;
            // note: the components calculate their fields using metadata, skip them if it's not available
            if (isDefined(asyncFieldsFunc)) {
              if (isDefined(metadata))
                asyncFieldNames.push(
                  asyncFieldsFunc(propName, model, metadata, fieldsContext)
                    .catch((error) => {
                      // fields of the nested form are not critical, fetch the rest of the form data
                      console.error(`Failed to get fields to fetch for the component '${propName}'`, error);
                      return [];
                    }),
                );
            } else if (isDefined(fieldsFunc)) {
              if (isDefined(metadata))
                fieldNames = fieldNames.concat(fieldsFunc(propName, model, metadata));
            } else
              fieldNames.push(propName);
          }
        }
      }
    }

    (await Promise.all(asyncFieldNames)).forEach((names) => {
      fieldNames = fieldNames.concat(names);
    });

    fieldNames = fieldNames.concat(gqlSettings.fieldsToFetch ?? []);

    for (const id in components) {
      if (components.hasOwnProperty(id) && isConfigurableFormComponent(components[id])) {
        const item = components[id];
        fieldNames = fieldNames.concat(this.#getFieldsFromCustomEvents(item.customEnabled));
        fieldNames = fieldNames.concat(this.#getFieldsFromCustomEvents(item.customVisibility));
        fieldNames = fieldNames.concat(this.#getFieldsFromCustomEvents(item.onBlurCustom));
        fieldNames = fieldNames.concat(this.#getFieldsFromCustomEvents(item.onChangeCustom));
        fieldNames = fieldNames.concat(this.#getFieldsFromCustomEvents(item.onFocusCustom));
      }
    }
    fieldNames.push('id');

    fieldNames = [...new Set(fieldNames)];
    fieldNames = fieldNames.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

    return fieldNames;
  };

  #getFieldsToFetchAsync = async (payload: GetGqlFieldsPayload): Promise<IFieldData[]> => {
    const { formSettings } = payload;
    const { getMetadata, getContainerProperties } = this.#metadataDispatcher;

    if (!formSettings.modelType) return Promise.resolve([]);

    const metadata = await getMetadata({ dataType: DataTypes.entityReference, modelType: formSettings.modelType });

    if (!metadata) {
      return Promise.resolve([]);
    }

    let fields: IFieldData[] = [];

    const fieldNames = await this.#getFormFieldsAsync(payload, metadata, new Set<string>());

    const metaProperties = asPropertiesArray(metadata.properties, []);

    // create list of promises
    const promises: Promise<void>[] = [];

    fieldNames.forEach((item) => {
      if (item) {
        item = item.trim();
        const pathParts = item.split('.');

        if (pathParts.length === 1) {
          const propertyName = pathParts[0]?.toLowerCase();
          if (isNullOrWhiteSpace(propertyName))
            throw new Error(`Invalid field name: ${item}`);

          fields.push({
            name: item,
            child: [],
            property: metaProperties.find((p) => p.path.toLowerCase() === propertyName),
          });
          return;
        }

        let parent: IFieldData | null = null;
        let containerPath = '';
        pathParts.forEach((part, idx) => {
          let levelChilds = parent?.child ?? fields;
          let field = levelChilds.find((f) => f.name === part);
          if (!field) {
            const newField: IFieldData = {
              name: part,
              child: [],
              property: idx === 0
                ? metaProperties.find((p) => p.path.toLowerCase() === part.toLowerCase())
                : parent?.property?.dataType === 'object' && isPropertiesArray(parent.property.properties)
                  ? parent.property.properties.find((p) => p.path.toLowerCase() === part.toLowerCase())
                  : undefined,
            };
            field = newField;
            // If property metadata is not set - fetch it using dispatcher.
            // Note: it's safe to fetch the same container multiple times because the dispatcher returns the same promise for all requests
            if (!newField.property) {
              const metaPromise = getContainerProperties({ metadata: metadata, containerPath: containerPath }).then(
                (response) => {
                  newField.property = response.find((p) => p.path.toLowerCase() === newField.name.toLowerCase());
                },
              );
              // add promise to list
              promises.push(metaPromise);
            }

            levelChilds.push(newField);
          }
          containerPath += (Boolean(containerPath) ? '.' : '') + part;
          parent = field;
        });
      }
    });

    const finalPromise = new Promise<IFieldData[]>((resolve, reject) => {
      Promise.allSettled(promises).then(() => {
        resolve(fields);
      }).catch(reject);
    });
    return await finalPromise;
  };
}

export const useGqlLoader = (): IFormDataLoader => {
  const httpClient = useHttpClient();
  const endpointsEvaluator = useModelApiHelper();
  const metadataDispatcher = useMetadataDispatcher();
  const toolboxComponents = useFormDesignerComponents();
  const configurationLoader = useConfigurationItemsLoader();

  const [loader] = useState<IFormDataLoader>(() => {
    return new GqlLoader({
      httpClient: httpClient,
      endpointsEvaluator: endpointsEvaluator,
      metadataDispatcher: metadataDispatcher,
      toolboxComponents: toolboxComponents,
      configurationLoader: configurationLoader,
    });
  });
  return loader;
};
