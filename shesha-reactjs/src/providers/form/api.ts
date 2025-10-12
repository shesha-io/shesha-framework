import {
  isFormFullName,
  isFormRawId,
} from './utils';
import { EntityAjaxResponse, IEntity } from '@/generic-pages/dynamic/interfaces';
import {
  FormDto,
  FormIdentifier,
  FormMarkupWithSettings,
  IComponentsDictionary,
  IFlatComponentsStructure,
  IFormDto,
  IFormSettings,
} from './models';
import { GetDataError, useGet } from '@/hooks';
import { IAbpWrappedGetEntityResponse } from '@/interfaces/gql';
import { IAjaxResponseBase } from '@/interfaces/ajaxResponse';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { IToolboxComponents } from '@/interfaces';
import { removeNullUndefined } from '@/providers/utils';
import {
  useEffect,
  useMemo,
} from 'react';

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
  /**
   * Generation logic type name
   */
  generationLogicTypeName?: string | null;
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
  data: IAbpWrappedGetEntityResponse<FormConfigurationDto>,
): FormMarkupWithSettings => {
  const markupJson = data?.result?.markup;
  return markupJson ? (JSON.parse(markupJson) as FormMarkupWithSettings) : null;
};

export const useFormConfiguration = (args: UseFormConfigurationArgs): IFormMarkupResponse => {
  const { formId } = args;
  const requestParams = useMemo(() => {
    if (isFormRawId(formId))
      return {
        url: '/api/services/Shesha/FormConfiguration/Get',
        queryParams: { id: args.formId as string },
      };

    if (isFormFullName(formId))
      return {
        url: '/api/services/Shesha/FormConfiguration/GetByName',
        queryParams: removeNullUndefined({ name: formId.name, module: formId.module }),
      };

    return null;
  }, [formId]);

  const canFetch = Boolean(requestParams && requestParams.url);
  const fetcher = useGet<
    IAbpWrappedGetEntityResponse<FormConfigurationDto>,
    IAjaxResponseBase,
    IGetFormByIdPayload | IGetFormByNamePayload
  >(requestParams?.url ?? '', { queryParams: requestParams?.queryParams, lazy: args.lazy || !canFetch });

  const reFetch = (): Promise<IAbpWrappedGetEntityResponse<FormConfigurationDto>> => {
    return fetcher.refetch({ path: requestParams.url, queryParams: requestParams.queryParams });
  };

  const reFetcher = (): Promise<FormMarkupWithSettings> => {
    return canFetch
      ? reFetch().then((response) => {
        return getMarkupFromResponse(response);
      })
      : Promise.reject('Can`t fetch form due to internal state');
  };

  useEffect(() => {
    if (fetcher.data && canFetch) reFetcher();
  }, []);

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
  onFormLoaded?: (form: IFormDto) => void;
  onDataLoaded?: (data: any) => void;
}

export type LoadingState = 'waiting' | 'loading' | 'ready' | 'failed';

export interface FormInfo extends Pick<FormDto, 'id' | 'module' | 'name'> {
  flatStructure: IFlatComponentsStructure;
  settings: IFormSettings;
}

export interface FormWithDataResponse {
  form?: FormInfo;
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
  form?: FormInfo;
  error?: IErrorInfo;
  dataFetcher?: () => Promise<EntityAjaxResponse | void>;
}

// just for intrenal use
interface IFieldData {
  name: string;
  child: IFieldData[];
  property: IPropertyMetadata;
}

export const filterDataByOutputComponents = (
  data: object,
  components: IComponentsDictionary,
  toolboxComponents: IToolboxComponents,
): any => {
  const newData = { ...data };
  for (const key in components) {
    if (components.hasOwnProperty(key)) {
      var component = components[key];
      if (component.propertyName &&
        component.type &&
        data.hasOwnProperty(component.propertyName) &&
        !toolboxComponents[component.type]?.isOutput) {
        delete data[component.propertyName];
      }
    }
  }

  return newData;
};

export const gqlFieldsToString = (fields: IFieldData[]): string => {
  const resf = (items: IFieldData[]): string => {
    let s = '';
    items.forEach((item) => {
      if (!(item.property ||
        item.name === 'id' ||
        item.name === '_className' ||
        item.name === '_displayName'
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
