import { asPropertiesArray, IApiEndpoint, IModelMetadata, isApiEndpoint, isPropertiesArray, StandardEntityActions } from "@/interfaces/metadata";
import { GetGqlFieldsPayload, IFieldData, IFormDataLoader, GetFormFieldsPayload, FormDataLoadingPayload, isGqlLoaderSettings, GqlLoaderSettings } from "./interfaces";
import { DataTypes, extractAjaxResponse, IAjaxResponse, IAnyObject, IToolboxComponents } from "@/interfaces";
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
}

// register loader factory and accept only form-specific parameters

export class GqlLoader<Values extends object = object> implements IFormDataLoader<Values> {
  #httpClient: HttpClientApi;

  #metadataDispatcher: IMetadataDispatcher;

  #toolboxComponents: IToolboxComponents;

  #endpointsEvaluator: IEntityEndpointsEvaluator;

  constructor(args: GqlLoaderArguments) {
    this.#httpClient = args.httpClient;
    this.#metadataDispatcher = args.metadataDispatcher;
    this.#toolboxComponents = args.toolboxComponents;
    this.#endpointsEvaluator = args.endpointsEvaluator;
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

  loadAsync = async (payload: FormDataLoadingPayload): Promise<Values | undefined> => {
    const { loadingCallback, formSettings, formArguments, formFlatStructure } = payload;
    try {
      const dataId = getIdOrUndefined(formArguments);
      if (!dataId)
        throw new Error('Data id is missing');

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

  #getFormFields = (payload: GetFormFieldsPayload, metadata: IModelMetadata): string[] => {
    const { formFlatStructure, formSettings } = payload;

    const gqlSettings = this.#getGqlSettings(formSettings);

    const toolboxComponents = this.#toolboxComponents;

    const { allComponents: components } = formFlatStructure;
    let fieldNames: string[] = [];
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
            const fieldsFunc = component.getFieldsToFetch;
            if (isDefined(fieldsFunc))
              fieldNames = fieldNames.concat(fieldsFunc(propName, model, metadata));
            else
              fieldNames.push(propName);
          }
        }
      }
    }

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

    const fieldNames = this.#getFormFields(payload, metadata);

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

  const [loader] = useState<IFormDataLoader>(() => {
    return new GqlLoader({
      httpClient: httpClient,
      endpointsEvaluator: endpointsEvaluator,
      metadataDispatcher: metadataDispatcher,
      toolboxComponents: toolboxComponents,
    });
  });
  return loader;
};
