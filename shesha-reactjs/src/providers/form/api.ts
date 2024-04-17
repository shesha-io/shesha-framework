import * as RestfulShesha from '@/utils/fetchers';
import {
  asFormFullName,
  asFormRawId,
  componentsTreeToFlatStructure,
  getComponentsFromMarkup,
  getMatchData,
  hasFormIdGotValue,
  IMatchData
} from './utils';
import { ConfigurationItemsViewMode } from '../appConfigurator/models';
import { DataTypes } from '@/interfaces/dataTypes';
import { EntityAjaxResponse, IEntity } from '@/generic-pages/dynamic/interfaces';
import {
  FormIdentifier,
  FormMarkupWithSettings,
  FormRawMarkup,
  IComponentsDictionary,
  IFormDto,
  IFormSettings
} from './models';
import { GetDataError, useGet } from '@/hooks';
import { getQueryParams, joinUrlAndPath } from '@/utils/url';
import { IAbpWrappedGetEntityResponse } from '@/interfaces/gql';
import { IAjaxResponseBase } from '@/interfaces/ajaxResponse';
import { asPropertiesArray, IApiEndpoint, IModelMetadata, IPropertyMetadata, isPropertiesArray, StandardEntityActions } from '@/interfaces/metadata';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { IMetadataDispatcherActionsContext } from '../metadataDispatcher/contexts';
import { IToolboxComponents } from '@/interfaces';
import { nanoid } from '@/utils/uuid';
import { removeNullUndefined } from '@/providers/utils';
import { useConfigurationItemsLoader } from '@/providers/configurationItemsLoader';
import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { useFormDesignerComponents } from './hooks';
import { useModelApiEndpoint, useModelApiHelper } from '@/components/configurableForm/useActionEndpoint';
import {
  useAppConfigurator,
  useMetadataDispatcher,
  useSheshaApplication,
} from '@/providers';

/**
 * Form configuration DTO
 */
export interface FormConfigurationDto {
  id?: string;
  /**
   * Form path/id is used to identify a form
   */
  moduleId?: string | null;
  /**
   * Form name
   */
  name?: string | null;
  /**
   * Label
   */
  label?: string | null;
  /**
   * Description
   */
  description?: string | null;
  /**
   * Markup in JSON format
   */
  markup?: string | null;
  /**
   * Type of the form model
   */
  modelType?: string | null;
  /**
   * Version number
   */
  versionNo?: number;
  /**
   * Version status
   */
  versionStatus?: number;
  /**
   * Cache MD5, is used for client-side caching
   */
  cacheMd5?: string | null;
}

export interface IFormFetcherProps {
  lazy: boolean;
}
export interface IFormByIdProps {
  id: string;
}
export interface IFormByNameProps {
  module?: string;
  name: string;
  version?: number;
}
export type UseFormConfigurationByIdArgs = IFormByIdProps & IFormFetcherProps;
export type UseFormConfigurationByNameArgs = IFormByNameProps & IFormFetcherProps;
export type UseFormConfigurationArgs = {
  formId: FormIdentifier;
} & IFormFetcherProps;

export interface IUseFormConfigurationProps {
  id?: string;
  module?: string;
  name: string;
  version?: number;
  lazy: boolean;
}

export type FormProperties = Omit<FormConfigurationDto, 'markup'>;

export interface IFormMarkupResponse {
  requestParams: any;
  formConfiguration: IFormDto;
  loading: boolean;
  error: GetDataError<IAjaxResponseBase>;
  refetch: () => Promise<FormMarkupWithSettings>;
}

interface IGetFormByNamePayload {
  module?: string;
  name: string;
  version?: number;
}

interface IGetFormByIdPayload {
  id: string;
}

export const getMarkupFromResponse = (
  data: IAbpWrappedGetEntityResponse<FormConfigurationDto>
): FormMarkupWithSettings => {
  const markupJson = data?.result?.markup;
  return markupJson ? (JSON.parse(markupJson) as FormMarkupWithSettings) : null;
};

/**
 * Load form markup from the back-end
 */
export const getFormConfiguration = (formId: FormIdentifier, backendUrl: string, httpHeaders: HeadersInit) => {
  const formRawId = asFormRawId(formId);
  const formFullName = removeNullUndefined(asFormFullName(formId));

  const requestParams = formRawId
    ? { url: '/api/services/Shesha/FormConfiguration/Get', queryParams: { id: formRawId } }
    : formFullName
      ? {
        url: '/api/services/Shesha/FormConfiguration/GetByName',
        queryParams: { name: formFullName.name, module: formFullName.module, version: formFullName.version },
      }
      : null;

  return RestfulShesha.get<IAbpWrappedGetEntityResponse<FormConfigurationDto>>(
    requestParams.url,
    requestParams.queryParams,
    { base: backendUrl, headers: httpHeaders }
  );
};

export const useFormConfiguration = (args: UseFormConfigurationArgs): IFormMarkupResponse => {
  const { configurationItemMode } = useAppConfigurator();

  const requestParams = useMemo(() => {
    const formRawId = asFormRawId(args.formId);
    const formFullName = removeNullUndefined(asFormFullName(args.formId));

    if (formRawId)
      return {
        url: '/api/services/Shesha/FormConfiguration/Get',
        queryParams: { id: formRawId },
      };

    if (formFullName)
      return {
        url: '/api/services/Shesha/FormConfiguration/GetByName',
        queryParams: { name: formFullName.name, module: formFullName.module, version: formFullName.version },
      };

    return null;
  }, [args.formId, configurationItemMode]);

  const canFetch = Boolean(requestParams && requestParams.url);
  const fetcher = useGet<
    IAbpWrappedGetEntityResponse<FormConfigurationDto>,
    IAjaxResponseBase,
    IGetFormByIdPayload | IGetFormByNamePayload
  >(requestParams?.url ?? '', { queryParams: requestParams?.queryParams, lazy: args.lazy || !canFetch });

  const reFetch = () => {
    return fetcher.refetch({ path: requestParams.url, queryParams: requestParams.queryParams });
  };

  const reFetcher = () => {
    return canFetch
      ? reFetch().then((response) => {
        return getMarkupFromResponse(response);
      })
      : Promise.reject('Can`t fetch form due to internal state');
  };

  useEffect(() => {
    if (fetcher.data && canFetch) reFetcher();
  }, [configurationItemMode]);

  const formConfiguration = useMemo<IFormDto>(() => {
    if (fetcher?.data?.result) {
      const markupWithSettings = getMarkupFromResponse(fetcher?.data);
      return {
        ...fetcher?.data?.result,
        markup: markupWithSettings?.components,
        settings: markupWithSettings?.formSettings,
      };
    } else return null;
  }, [args.formId, fetcher?.data]);

  const result: IFormMarkupResponse = {
    formConfiguration: formConfiguration,
    loading: fetcher.loading,
    error: fetcher.error,
    refetch: reFetcher,
    requestParams: requestParams,
  };
  return result;
};

export interface UseFormWitgDataArgs {
  formId?: FormIdentifier;
  dataId?: string;
  configurationItemMode?: ConfigurationItemsViewMode;
  onFormLoaded?: (form: IFormDto) => void;
  onDataLoaded?: (data: any) => void;
}

export type LoadingState = 'waiting' | 'loading' | 'ready' | 'failed';

export interface FormWithDataResponse {
  form?: IFormDto;
  fetchedData?: IEntity;
  loadingState: LoadingState;
  loaderHint?: string;
  error?: IErrorInfo;
  dataFetcher?: () => Promise<EntityAjaxResponse | void>;
  refetcher?: () => void;
}
export interface FormWithDataState {
  loaderHint?: string;
  loadingState: LoadingState;
  fetchedData?: IEntity;
  gqlFields?: string;
  getDataUrl?: string;
  form?: IFormDto;
  error?: IErrorInfo;
  dataFetcher?: () => Promise<EntityAjaxResponse | void>;
}

interface GetFormFieldsPayload {
  formMarkup: FormRawMarkup;
  formSettings: IFormSettings;
  toolboxComponents: IToolboxComponents;
}

// just for intrenal use
interface IFieldData {
  name: string;
  child: IFieldData[];
  property: IPropertyMetadata;
}

export const filterDataByOutputComponents = (
  data: any,
  components: IComponentsDictionary,
  toolboxComponents: IToolboxComponents,
) => {
  const newData = { ...data };
  for (const key in components) {
    if (components.hasOwnProperty(key)) {
      var component = components[key];
      if (data.hasOwnProperty(component.propertyName) && !toolboxComponents[component.type].isOutput) {
         delete data[component.propertyName];
      }
    }
  }

  return newData;
};

const getFieldsFromCustomEvents = (code: string) => {
  if (!code) return [];
  const reg = new RegExp('(?<![_a-zA-Z0-9.])data.[_a-zA-Z0-9.]+', 'g');
  const matchAll = code.matchAll(reg);
  if (!matchAll) return [];
  const match = Array.from(matchAll);
  return match.map((item) => item[0].replace('data.', ''));
};

export const gqlFieldsToString = (fields: IFieldData[]): string => {
  const resf = (items: IFieldData[]) => {
    let s = '';
    items.forEach((item) => {
      if (!(item.property
          || item.name === 'id'
          || item.name === '_className'
          || item.name === '_displayName'
      )) return;
      s += s ? ',' + item.name : item.name;
      if (item.child.length > 0) {
        s += '{' + resf(item.child) + '}';
      }
    });

    return s;
  };

  return resf(fields);
};

const getFormFields = (payload: GetFormFieldsPayload, metadata: IModelMetadata): string[] => {
  const { formMarkup, formSettings, toolboxComponents } = payload;
  if (!formMarkup) return null;

  const components = componentsTreeToFlatStructure(
    toolboxComponents,
    getComponentsFromMarkup(formMarkup)
  ).allComponents;
  let fieldNames = [];
  for (const key in components) {
    if (components.hasOwnProperty(key)) {
      var model = components[key];
      var component = toolboxComponents[model.type];
      
      // get data only for isInput components
      // and for context = null or empty string (form context)
      if (component?.isInput && !model.context) {
        const propName = model.propertyName;
        fieldNames.push(propName);
        const fieldsFunc = component?.getFieldsToFetch;
        if (typeof fieldsFunc === 'function')
          fieldNames = fieldNames.concat(fieldsFunc(propName, model, metadata) ?? []);
    }
  }
  }

  fieldNames = fieldNames.concat(formSettings?.fieldsToFetch ?? []);

  formMarkup.forEach((item) => {
    fieldNames = fieldNames.concat(getFieldsFromCustomEvents(item.customEnabled));
    fieldNames = fieldNames.concat(getFieldsFromCustomEvents(item.customVisibility));
    fieldNames = fieldNames.concat(getFieldsFromCustomEvents(item.onBlurCustom));
    fieldNames = fieldNames.concat(getFieldsFromCustomEvents(item.onChangeCustom));
    fieldNames = fieldNames.concat(getFieldsFromCustomEvents(item.onFocusCustom));
  });
  fieldNames.push('id');

  fieldNames = [...new Set(fieldNames)];
  fieldNames = fieldNames.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  return fieldNames;
};

interface GetGqlFieldsPayload extends GetFormFieldsPayload {
  getContainerProperties: IMetadataDispatcherActionsContext['getContainerProperties'];
  getMetadata: IMetadataDispatcherActionsContext['getMetadata'];
}

export const getGqlFields = (payload: GetGqlFieldsPayload): Promise<IFieldData[]> => {
  const { formMarkup, formSettings, getMetadata, getContainerProperties } = payload;

  if (!formMarkup || !formSettings.modelType) return Promise.resolve([]);

  return getMetadata({ dataType: DataTypes.entityReference, modelType: formSettings.modelType }).then((metadata) => {
    let fields: IFieldData[] = [];

    const fieldNames = getFormFields(payload, metadata);

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
                }
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

    return new Promise<IFieldData[]>((resolve) => {
      Promise.allSettled(promises).then(() => {
        resolve(fields);
      });
    });
  });
};

export const useFormWithData = (args: UseFormWitgDataArgs): FormWithDataResponse => {
  const { formId, dataId, configurationItemMode } = args;
  const { getForm } = useConfigurationItemsLoader();
  const { backendUrl, httpHeaders } = useSheshaApplication();

  const [state, setState] = useState<FormWithDataState>({ loadingState: 'waiting' });
  const { getMetadata, isEntityType, getContainerProperties } = useMetadataDispatcher();
  const toolboxComponents = useFormDesignerComponents();
  const endpointsHelper = useModelApiHelper();

  const formRequestRef = useRef<string>();

  const fetch = (getDataUrl, gqlFields, requestId) => {
    // fetch data and resolve
    const queryParams = { properties: gqlFields };
    if (dataId) queryParams['id'] = dataId;

    const dataFetcher = () =>
      RestfulShesha.get<EntityAjaxResponse, any, any, any>(getDataUrl, queryParams, {
        base: backendUrl,
        headers: httpHeaders,
      })
        .then((dataResponse) => {
          if (formRequestRef.current !== requestId) return null; // todo: cancel data request

          if (dataResponse.success) {
            setState((prev) => ({
              ...prev,
              loadingState: 'ready',
              loaderHint: null,
              fetchedData: dataResponse.result,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              loadingState: 'failed',
              loaderHint: null,
              fetchedData: null,
              error: dataResponse.error,
            }));
          }
          return dataResponse;
        })
        .catch((e) => {
          const error = (e as IAjaxResponseBase)?.error;
          setState((prev) => ({ ...prev, loadingState: 'failed', loaderHint: null, error: error }));
        });

    setState((prev) => ({ ...prev, loaderHint: 'Fetching data...', dataFetcher: dataFetcher }));
    dataFetcher();
  };

  const fetchAll = (skipCache: boolean) => {
    const requestId = nanoid();
    formRequestRef.current = requestId;

    if (hasFormIdGotValue(formId)) {
      // fetch only data if dataId if changed
      if (
        Boolean(state.form) &&
        ((typeof formId === 'string' && formId === state.form.id) ||
          (typeof formId === 'object' &&
            formId.module === state.form.module &&
            formId.name === state.form.name &&
            (!Boolean(formId.version) || formId.version === state.form.versionNo)))
      ) {
        if (dataId !== state.fetchedData?.id) {
          fetch(state.getDataUrl, state.gqlFields, requestId);
          return;
        }
      }

      setState((prev) => ({
        ...prev,
        loadingState: 'loading',
        loaderHint: 'Fetching form...',
        error: null,
        dataFetcher: null,
        form: null,
        fetchedData: null,
      }));

      getForm({ formId, configurationItemMode: args.configurationItemMode, skipCache: skipCache })
        .then((form) => {
          if (formRequestRef.current !== requestId) return;

          // apply loaded form
          setState((prev) => ({ ...prev, form: form }));

          isEntityType(form.settings?.modelType).then((modelIsEntity) => {
            //if (dataId || !modelIsEntity) {
            endpointsHelper
              .getFormActionUrl({ actionName: StandardEntityActions.read, formSettings: form.settings, mappings: [] })
              .then((getDataEndpoint) => {
                const getDataUrl =
                  getDataEndpoint && getDataEndpoint.httpVerb?.toLowerCase() === 'get' // note: support get only here
                    ? getDataEndpoint.url
                    : null;

                if (Boolean(getDataUrl)) {
                  setState((prev) => ({ ...prev, getDataUrl, loaderHint: 'Fetching metadata...' }));

                  // fetch meta before the data
                  getGqlFields({
                    formMarkup: form.markup,
                    formSettings: form.settings,
                    toolboxComponents,
                    getContainerProperties,
                    getMetadata,
                  }).then((gqlFieldsList) => {
                    if (formRequestRef.current !== requestId) return;

                    var gqlFields = gqlFieldsToString(gqlFieldsList);

                    setState((prev) => ({ ...prev, gqlFields }));

                    if (dataId || !modelIsEntity) {
                      fetch(getDataUrl, gqlFields, requestId);
                    } else {
                      // data loading is not required
                      setState((prev) => ({ ...prev, loadingState: 'ready', loaderHint: null }));
                    }
                  });
                } else {
                  // data loading is not required
                  setState((prev) => ({ ...prev, loadingState: 'ready', loaderHint: null }));
                }
              })
              .catch((e) => {
                console.error('Failed to get endpoint for data fetching', e);
                setState((prev) => ({ ...prev, loadingState: 'failed', loaderHint: null, error: e }));
              });
            //} else {
            //    setState(prev => ({ ...prev, loadingState: 'ready', loaderHint: null }));
            //}
          });
        })
        .catch((e) => {
          setState((prev) => ({ ...prev, loadingState: 'failed', loaderHint: null, error: e }));
        });
    } else {
      setState((prev) => ({
        ...prev,
        loadingState: 'waiting',
        loaderHint: null,
        error: null,
        form: null,
        dataFetcher: null,
        fetchedData: null,
      }));
    }
  };

  useEffect(() => {
    fetchAll(false);

    // return cleanup: clean up form and data
  }, [formId, dataId, configurationItemMode]);

  const result: FormWithDataResponse = {
    loaderHint: state.loaderHint,
    loadingState: state.loadingState,
    form: state.form,
    fetchedData: state.fetchedData,
    error: state.error,
    dataFetcher: state.dataFetcher,
    refetcher: () => {
      fetchAll(true);
    },
  };

  return result;
};

export interface UseFormDataArguments {
  formSettings: IFormSettings;
  formMarkup: FormRawMarkup;
  urlEvaluationData: IMatchData[];
  lazy: boolean;
}

const getCorrectGetUrl = (endpoint: IApiEndpoint): string => {
  return endpoint && endpoint.httpVerb?.toLowerCase() === 'get' ? endpoint.url : null;
};

export type EntityFetcher = () => Promise<EntityAjaxResponse>;
export interface UseFormDataResult {
  //form?: IFormDto;
  fetchedData?: IEntity;
  loadingState: LoadingState;
  loaderHint?: string;
  error?: IErrorInfo;
  dataFetcher?: EntityFetcher;
}
export interface UseFormDataState {
  data: IEntity;
  error: IErrorInfo;
  loadingState: LoadingState;
  loaderHint?: string;
  dataFetcher?: EntityFetcher;
}
export const useFormData = (args: UseFormDataArguments): UseFormDataResult => {
  // evaluate url (default or specified in the formSettings)
  // prepare a list of GQL fields
  // call fetcher
  const { formSettings, formMarkup, urlEvaluationData, lazy } = args;

  const [state, setState] = useState<UseFormDataState>({
    data: null,
    error: null,
    loadingState: 'waiting',
  });

  const readEndpoint = useModelApiEndpoint({
    actionName: StandardEntityActions.read,
    formSettings: formSettings,
    mappings: urlEvaluationData,
  });

  const { getMetadata, getContainerProperties } = useMetadataDispatcher();
  const toolboxComponents = useFormDesignerComponents();
  const { backendUrl, httpHeaders } = useSheshaApplication();

  const getUrl = getCorrectGetUrl(readEndpoint);

  const requestUidRef = useRef<string>();

  const fetcherPromise = useMemo<Promise<EntityFetcher>>(() => {
    if (!getUrl)
      return Promise.resolve(
        () =>
          new Promise((_resolve, reject) => {
            reject('Get data url is not defined');
          })
      );

    const requestId = nanoid();
    requestUidRef.current = requestId;

    const fullUrl = joinUrlAndPath(backendUrl, getUrl);
    const urlObj = new URL(decodeURIComponent(fullUrl));
    let queryParams = getQueryParams(fullUrl);

    const getDataUrl = urlObj.pathname;

    // todo: check ?
    // Boolean(queryParams?.id)
    const fetcher = getGqlFields({
      formMarkup: formMarkup,
      formSettings: formSettings,
      toolboxComponents,
      getContainerProperties,
      getMetadata,
    }).then((gqlFieldsList) => {
      var gqlFields = gqlFieldsToString(gqlFieldsList);

      // fetch data and resolve
      queryParams = { ...queryParams, properties: gqlFields };
      if (!queryParams['id'] && urlEvaluationData) {
        const initialValues = getMatchData(urlEvaluationData, 'initialValues');
        if (initialValues?.id) queryParams['id'] = initialValues?.id;
      }

      const dataFetcher = () => {
        return RestfulShesha.get<EntityAjaxResponse, any, any, any>(getDataUrl, queryParams, {
          base: backendUrl,
          headers: httpHeaders,
        })
          .then((dataResponse) => {
            if (requestUidRef.current !== requestId) return null; // todo: cancel data request

            if (dataResponse.success) {
              setState((prev) => ({
                ...prev,
                loadingState: 'ready',
                loaderHint: null,
                data: dataResponse.result,
              }));
            } else {
              setState((prev) => ({
                ...prev,
                loadingState: 'failed',
                loaderHint: null,
                data: null,
                error: dataResponse.error,
              }));
            }
            return dataResponse;
          })
          .catch((e) => {
            const error = (e as IAjaxResponseBase)?.error;
            setState((prev) => ({ ...prev, loadingState: 'failed', loaderHint: null, error: error }));
            return null;
          });
      };

      if (!lazy) {
        setState((prev) => ({ ...prev, loaderHint: 'Fetching data...', dataFetcher: dataFetcher }));
        dataFetcher();
      }

      return dataFetcher;
    });

    return fetcher;
  }, [getUrl]);

  const unevaluatedFetcher = () => fetcherPromise.then((f) => f());
  const result: UseFormDataResult = {
    fetchedData: state.data,
    error: state.error,
    loadingState: state.loadingState,
    loaderHint: state.loaderHint,
    dataFetcher: state.dataFetcher ?? unevaluatedFetcher,
  };

  return result;
};