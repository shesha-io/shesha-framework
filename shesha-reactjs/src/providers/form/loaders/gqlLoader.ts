import { asPropertiesArray, IApiEndpoint, IModelMetadata, isPropertiesArray, StandardEntityActions } from "@/interfaces/metadata";
import { GetGqlFieldsPayload, IFieldData, IFormDataLoader, GetFormFieldsPayload, FormDataLoadingPayload, isGqlLoaderSettings, GqlLoaderSettings } from "./interfaces";
import { DataTypes, IToolboxComponents } from "@/interfaces";
import { HttpClientApi, useHttpClient } from "@/providers/sheshaApplication/publicApi";
import { IMetadataDispatcher } from "@/providers/metadataDispatcher/contexts";
import { IEntityEndpointsEvaluator, useModelApiHelper } from "@/components/configurableForm/useActionEndpoint";
import { gqlFieldsToString } from "../api";
import { constructUrl } from "@/utils/fetchers";
import { useState } from "react";
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { IFormSettings, useMetadataDispatcher } from "@/providers";
import { EntityAjaxResponse } from "@/generic-pages/dynamic/interfaces";
import { isDefined } from "@/utils/nullables";

export interface GqlLoaderArguments {
  httpClient: HttpClientApi;
  metadataDispatcher: IMetadataDispatcher;
  toolboxComponents: IToolboxComponents;
  endpointsEvaluator: IEntityEndpointsEvaluator;
}

// register loader factory and accept only form-specific parameters

export class GqlLoader implements IFormDataLoader {
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
    const loaderSettings = dataLoadersSettings?.['gql'];
    return isGqlLoaderSettings(loaderSettings) ? loaderSettings : { endpointType: 'default' };
  };

  getEndpointAsync = async (payload: FormDataLoadingPayload): Promise<IApiEndpoint> => {
    const { formSettings } = payload;
    const gqlSettings = this.#getGqlSettings(formSettings);
    const { endpointType, staticEndpoint, dynamicEndpoint } = gqlSettings;

    switch (endpointType) {
      case 'default': {
        return await this.#endpointsEvaluator.getFormActionUrl({ actionName: StandardEntityActions.read, formSettings: formSettings, mappings: [] });
      }
      case 'static': {
        return { ...staticEndpoint, httpVerb: staticEndpoint?.httpVerb || 'get' };
      }
      case 'dynamic': {
        const dynamicEvaluated = await payload.expressionExecuter(dynamicEndpoint, { });
        return dynamicEvaluated;
      }
      default:
        return null;
    }
  };

  loadAsync = async (payload: FormDataLoadingPayload): Promise<any> => {
    const { loadingCallback, formSettings, formArguments, formFlatStructure } = payload;
    const dataId = formArguments?.id;
    if (!dataId)
      throw new Error('Data id is missing');

    const endpoint = await this.getEndpointAsync(payload);

    // TODO: implement data loading using different http verbs
    const getDataUrl = endpoint && endpoint.httpVerb?.toLowerCase() === 'get' // note: support get only here
      ? endpoint.url
      : null;

    loadingCallback?.({ loadingState: 'loading', loaderHint: 'Fetching metadata...' });
    const gqlFieldsList = await this.#getFieldsToFetchAsync({
      formSettings: formSettings,
      formFlatStructure: formFlatStructure,
    });
    var gqlFields = gqlFieldsToString(gqlFieldsList);

    const queryParams = { properties: gqlFields };
    if (dataId) queryParams['id'] = dataId;
    const finalUrl = constructUrl(null, getDataUrl, queryParams);

    loadingCallback?.({ loadingState: 'loading', loaderHint: 'Fetching data...' });

    const response = await this.#httpClient.get<EntityAjaxResponse>(finalUrl);

    if (response.data.success) {
      loadingCallback?.({ loadingState: 'ready', loaderHint: null });

      return response.data.result;
    } else {
      loadingCallback?.({ loadingState: 'failed', error: response.data.error });
      return undefined;
    }
  };

  #getFieldsFromCustomEvents = (code: string): string[] => {
    if (!code) return [];
    const reg = new RegExp('(?<![_a-zA-Z0-9.])data.[_a-zA-Z0-9.]+', 'g');
    const matchAll = code.matchAll(reg);
    if (!matchAll) return [];
    const match = Array.from(matchAll);
    return match.map((item) => item[0].replace('data.', ''));
  };

  #getFormFields = (payload: GetFormFieldsPayload, metadata: IModelMetadata): string[] => {
    const { formFlatStructure, formSettings } = payload;
    if (!formFlatStructure) return null;

    const gqlSettings = this.#getGqlSettings(formSettings);

    const toolboxComponents = this.#toolboxComponents;

    const { allComponents: components } = formFlatStructure;
    let fieldNames = [];
    for (const key in components) {
      if (components.hasOwnProperty(key)) {
        var model = components[key];
        var component = toolboxComponents[model.type];

        // get data only for isInput components
        // and for context = null or empty string (form context)
        if (component && (component.isInput || component.isOutput) && !model.context) {
          const propName = model.propertyName;

          // TODO: AS - calc actual propName from JS setting
          if (typeof propName === 'string') {
            fieldNames.push(propName);
            const fieldsFunc = component?.getFieldsToFetch;
            if (typeof fieldsFunc === 'function')
              fieldNames = fieldNames.concat(fieldsFunc(propName, model, metadata) ?? []);
          }
        }
      }
    }

    fieldNames = fieldNames.concat(gqlSettings?.fieldsToFetch ?? []);

    for (const id in components) {
      if (components.hasOwnProperty(id)) {
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

    let fields: IFieldData[] = [];

    const fieldNames = this.#getFormFields(payload, metadata);

    const metaProperties = asPropertiesArray(metadata.properties, []);

    // create list of promises
    const promises: Promise<any>[] = [];

    fieldNames.forEach((item) => {
      if (item) {
        item = item.trim();
        const pathParts = item.split('.');

        if (pathParts.length === 1) {
          fields.push({
            name: item,
            child: [],
            property: metaProperties.find((p) => p.path.toLowerCase() === pathParts[0].toLowerCase()),
          });
          return;
        }

        let parent: IFieldData = null;
        let containerPath = '';
        pathParts.forEach((part, idx) => {
          let levelChilds = parent?.child ?? fields;
          let field = levelChilds.find((f) => f.name === part);
          if (!field) {
            field = {
              name: part,
              child: [],
              property:
                                idx === 0
                                  ? metaProperties.find((p) => p.path.toLowerCase() === part.toLowerCase())
                                  : parent?.property?.dataType === 'object' && isPropertiesArray(parent.property.properties)
                                    ? parent.property.properties.find((p) => p.path.toLowerCase() === part.toLowerCase())
                                    : null,
            };
            // If property metadata is not set - fetch it using dispatcher.
            // Note: it's safe to fetch the same container multiple times because the dispatcher returns the same promise for all requests
            if (!field.property) {
              const metaPromise = getContainerProperties({ metadata: metadata, containerPath: containerPath }).then(
                (response) => {
                  field.property = response.find((p) => p.path.toLowerCase() === field.name.toLowerCase());
                },
              );
              // add promise to list
              promises.push(metaPromise);
            }

            levelChilds.push(field);
          }
          containerPath += (Boolean(containerPath) ? '.' : '') + part;
          parent = field;
        });
      }
    });

    const finalPromise = new Promise<IFieldData[]>((resolve) => {
      Promise.allSettled(promises).then(() => {
        resolve(fields);
      });
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
