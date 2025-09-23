import localForage from 'localforage';
import React, { FC, PropsWithChildren, useContext, useRef } from 'react';
import { FormIdFullNameDtoAjaxResponse } from '@/apis/entityConfig';
import { FormConfigurationDto, FormConfigurationGetByNameQueryParams, FormConfigurationGetQueryParams } from '@/apis/formConfiguration';
import { ReferenceListItemDto, ReferenceListWithItemsDto } from '@/apis/referenceList';
import { IDictionary } from '@/interfaces';
import { IReferenceList, IReferenceListIdentifier, IReferenceListItem } from '@/interfaces/referenceList';
import { FormIdentifier, useFormDesignerComponents, useHttpClient } from '@/providers';
import { MakePromiseWithState, PromisedValue } from '@/utils/promises';
import { FormFullName, FormMarkupWithSettings, IFormDto } from '../form/models';
import { isFormFullName, isFormRawId } from '../form/utils';
import { isValidRefListId } from '../referenceListDispatcher/utils';
import {
  ConfigurationItemsLoaderActionsContext,
  IClearFormCachePayload,
  IConfigurationItemsLoaderActionsContext,
  IGetComponentPayload,
  IGetFormPayload,
  IGetRefListPayload,
  IUpdateComponentPayload,
} from './contexts';
import { IFormsDictionary, IReferenceListsDictionary } from './models';
import { getFormForbiddenMessage, getFormNotFoundMessage, getReferenceListNotFoundMessage } from './utils';
import { migrateFormSettings } from '../form/migration/formSettingsMigrations';
import { extractAjaxResponse, IAjaxResponse, isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';
import { isDefined } from '@/configuration-studio/types';
import { buildUrl } from '@/utils/url';
import { HttpResponse } from '@/publicJsApis/httpClient';
import axios from 'axios';
import { IComponentSettings } from '../appConfigurator/models';

type LocalForage = ReturnType<typeof localForage.createInstance>;
type StoragesDictionary = IDictionary<LocalForage | undefined>;

enum ItemTypes {
  ReferenceList = 'ref-lists',
  Form = 'forms',
  Component = 'components',
}

const mapRefListItemDtoToRefListItem = (item: ReferenceListItemDto): IReferenceListItem => {
  return {
    color: item.color,
    description: item.description,
    id: item.id,
    icon: item.icon,
    item: item.item,
    itemValue: item.itemValue,
    orderIndex: item.orderIndex,
    shortAlias: item.shortAlias,
  };
};

const ConfigurationItemsLoaderProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const httpClient = useHttpClient();

  const designerComponents = useFormDesignerComponents();

  const storages = useRef<StoragesDictionary>({});
  const getStorage = (name: string): LocalForage => {
    if (!storages.current[name]) {
      storages.current[name] = localForage.createInstance({ name: name });
    }

    return storages.current[name];
  };

  const forms = useRef<IFormsDictionary>({});
  const referenceLists = useRef<IReferenceListsDictionary>({});

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  const makeRefListLoadingKey = (payload: IGetRefListPayload): string => {
    const { refListId } = payload;
    return `${refListId.module}/${refListId.name}`;
  };

  const getMarkupFromResponse = (data: FormConfigurationDto): FormMarkupWithSettings | null => {
    const markupJson = data.markup;
    return markupJson ? (JSON.parse(markupJson) as FormMarkupWithSettings) : null;
  };

  const getCacheKeyByFullName = (module: string | null, name: string): string => {
    return `${module}:${name}`;
  };
  const getCacheKeyByRawId = (rawId: string): string => {
    return `${rawId}`;
  };

  const getFromCache = <TDto = unknown>(itemType: ItemTypes, key: string): Promise<TDto | null> => {
    const cacheStorage = getStorage(itemType);
    return key
      ? cacheStorage.getItem<TDto>(key).catch((e) => {
        console.warn(`Failed to get from cache, key=${key}`, e);
        return null;
      })
      : Promise.resolve(null);
  };

  const addToCache = <T = unknown>(itemType: ItemTypes, cacheKey: string, data: T): void => {
    if (!cacheKey) throw new Error("Cache key can't be empty");

    const cacheStorage = getStorage(itemType);

    cacheStorage.setItem(cacheKey, data).catch((e) => {
      console.warn(`Failed to cache configuration item with key '${cacheKey}'`, e);
    });
  };

  const convertFormConfigurationDto2FormDto = (dto: FormConfigurationDto): IFormDto => {
    const markupWithSettings = getMarkupFromResponse(dto);

    const result: IFormDto = {
      id: dto.id,
      name: dto.name,
      module: dto.module,
      label: dto.label,
      description: dto.description,
      modelType: dto.modelType,
      markup: markupWithSettings?.components ?? null,
      settings: markupWithSettings?.formSettings ?? null,
    };

    if (result.settings) {
      // there can be string for some old forms
      const rawAccess = result.settings.access ?? dto.access;
      let normalizedAccess: number;
      if (typeof rawAccess === 'string') {
        const parsed = parseInt(rawAccess, 10);
        normalizedAccess = Number.isNaN(parsed) ? 3 : parsed;
      } else if (typeof rawAccess === 'number') {
        normalizedAccess = rawAccess;
      } else {
        normalizedAccess = 3;
      }
      result.settings.access = normalizedAccess;
      result.settings.permissions = result.settings.permissions ?? dto.permissions ?? [];
    }

    return result;
  };

  const getFormCacheKey = (formId: FormIdentifier): string => {
    if (isFormFullName(formId))
      return getCacheKeyByFullName(formId.module, formId.name);
    if (isFormRawId(formId))
      return getCacheKeyByRawId(formId);
    throw new Error('Unsupported form identifier', formId);
  };

  const getRefListCacheKey = (
    listId: IReferenceListIdentifier,
  ): string => {
    return getCacheKeyByFullName(listId.module, listId.name);
  };

  const getRefList = (payload: IGetRefListPayload): PromisedValue<IReferenceList> => {
    // create a key
    const key = makeRefListLoadingKey(payload);

    if (!payload.skipCache) {
      const loadedRefList = referenceLists.current[key];
      if (loadedRefList) return loadedRefList; // TODO: check for rejection
    }

    const { refListId } = payload;

    const refListPromise = new Promise<IReferenceList>((resolve, reject) => {
      if (!isValidRefListId(refListId)) reject('Reference List identifier must be specified');

      const cacheKey = getRefListCacheKey(refListId);

      getFromCache<IReferenceList>(ItemTypes.ReferenceList, cacheKey).then((cachedDto) => {
        const url = `/api/services/app/ReferenceList/GetByName?module=${refListId.module}&name=${refListId.name}&md5=${cachedDto?.cacheMd5}`;
        const promise = httpClient.get<IAjaxResponse<ReferenceListWithItemsDto>>(url);

        promise
          .then((httpResponse) => {
            const response = httpResponse.data;
            if (isAjaxSuccessResponse(response)) {
              const responseData = response.result;
              const dto: IReferenceList = {
                name: responseData.name,
                items: responseData.items.map((item) => mapRefListItemDtoToRefListItem(item)),
              };
              addToCache(ItemTypes.ReferenceList, cacheKey, responseData);
              resolve(dto);
            }
          }
          )
          .catch((e) => {
            if (axios.isAxiosError(e)) {
              switch (e.status) {
              case 304:
                // code 304 indicates that the content ws not modified - use cached value
                if (cachedDto)
                  resolve(cachedDto);
                else
                  reject(new Error('Unknown cache error', { cause: e }));
                return;
              case 404:
                reject({ code: e.status, message: getReferenceListNotFoundMessage(refListId) });
                return;
              }
            }
            reject(e);
          });
      });
    });

    const promiseWithState = MakePromiseWithState(refListPromise);
    referenceLists.current[key] = promiseWithState;

    return promiseWithState;
  };

  const getCachedForm = (payload: IGetFormPayload): Promise<IFormDto> | null => {
    // create a key
    const key = getFormCacheKey(payload.formId);

    if (!payload.skipCache) {
      const loadedForm = forms.current[key];
      if (isDefined(loadedForm)) return loadedForm; // TODO: check for rejection
    }
    return null;
  };

  const getFormByName = (queryParams: FormConfigurationGetByNameQueryParams): Promise<HttpResponse<IAjaxResponse<FormConfigurationDto>>> => {
    const url = buildUrl(`/api/services/Shesha/FormConfiguration/GetByName`, queryParams);
    return httpClient.get<IAjaxResponse<FormConfigurationDto>>(url);
  };

  const getFormById = (queryParams: FormConfigurationGetQueryParams): Promise<HttpResponse<IAjaxResponse<FormConfigurationDto>>> => {
    const url = buildUrl(`/api/services/Shesha/FormConfiguration/Get`, queryParams);
    return httpClient.get<IAjaxResponse<FormConfigurationDto>>(url);
  };

  const getForm = (payload: IGetFormPayload): Promise<IFormDto> => {
    const key = getFormCacheKey(payload.formId);

    if (!payload.skipCache) {
      const loadedForm = forms.current[key];
      if (isDefined(loadedForm)) return loadedForm; // TODO: check for rejection
    }

    const { formId } = payload;

    const formPromise = new Promise<IFormDto>((resolve, reject) => {
      if (!isFormRawId(formId) && !isFormFullName(formId)) reject('Form identifier must be specified');

      const cacheKey = getFormCacheKey(formId);

      getFromCache<FormConfigurationDto>(ItemTypes.Form, cacheKey).then((cachedDto) => {
        const promise = isFormFullName(formId)
          ? getFormByName(
            {
              name: formId.name,
              module: formId.module,
              md5: cachedDto?.cacheMd5 ?? null,
            }
          )
          : isFormRawId(formId)
            ? getFormById(
              { id: formId, md5: cachedDto?.cacheMd5 ?? null },
            )
            : Promise.reject('Form identifier must be specified');

        promise
          .then((httpResponse) => {
            const response = httpResponse.data;

            if (isAjaxSuccessResponse(response)) {
              const responseData = response.result;
              if (!isDefined(responseData)) throw 'Failed to fetch form. Response is empty';

              const dto = migrateFormSettings(convertFormConfigurationDto2FormDto(responseData), designerComponents);
              addToCache(ItemTypes.Form, cacheKey, responseData);

              resolve(dto);
            } else {
              reject(response.error);
            }
          })
          .catch((e) => {
            if (axios.isAxiosError(e)) {
              switch (e.status) {
              case 304:
                if (cachedDto) {
                  const dto = migrateFormSettings(convertFormConfigurationDto2FormDto(cachedDto), designerComponents);
                  resolve(dto);
                } else
                  reject(new Error('Unknown cache error', { cause: e }));
                return;
              case 404:
                reject({ code: e.status, message: getFormNotFoundMessage(formId) });
                return;
              case 401:
              case 403:
                reject({ code: e.status, message: getFormForbiddenMessage(formId) });
                return;
              }
            }
            reject(e);
          });
      });
    });
    forms.current[key] = formPromise;

    return formPromise;
  };

  const getComponent = (_payload: IGetComponentPayload): PromisedValue<IComponentSettings> => {
    throw new Error('Not implemented');
  };

  const updateComponent = (_payload: IUpdateComponentPayload): Promise<void> => {
    throw new Error('Not implemented');
  };

  const clearFormCache = (payload: IClearFormCachePayload): void => {
    const cacheKey = getFormCacheKey(payload.formId);

    delete forms.current[cacheKey];
  };

  const getEntityFormId = async (className: string, formType: string): Promise<FormFullName> => {
    const url = buildUrl('/api/services/app/EntityConfig/GetEntityConfigForm', { entityConfigName: className, typeName: formType });

    const response = await httpClient.get<FormIdFullNameDtoAjaxResponse>(url);
    const dto = extractAjaxResponse(response.data);
    return { name: dto.name, module: dto.module };
  };

  const loaderActions: IConfigurationItemsLoaderActionsContext = {
    getCachedForm,
    getForm,
    getRefList,
    getComponent,
    updateComponent,
    clearFormCache,
    getEntityFormId,
  };

  return (
    <ConfigurationItemsLoaderActionsContext.Provider value={loaderActions}>
      {children}
    </ConfigurationItemsLoaderActionsContext.Provider>
  );
};

const useConfigurationItemsLoader = (): IConfigurationItemsLoaderActionsContext => {
  const context = useContext(ConfigurationItemsLoaderActionsContext);

  if (context === undefined)
    throw new Error('useConfigurationItemsLoader must be used within a ConfigurationItemsLoaderProvider');

  return context;
};

export {
  ConfigurationItemsLoaderProvider,
  useConfigurationItemsLoader,
};
