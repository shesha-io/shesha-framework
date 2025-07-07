import localForage from 'localforage';
import React, { FC, PropsWithChildren, useContext, useRef } from 'react';
import { configurableComponentGetByName, configurableComponentUpdateSettings } from '@/apis/configurableComponent';
import { entityConfigGetEntityConfigForm } from '@/apis/entityConfig';
import { FormConfigurationDto, formConfigurationGet, formConfigurationGetByName } from '@/apis/formConfiguration';
import { referenceListGetByName } from '@/apis/referenceList';
import useThunkReducer from '@/hooks/thunkReducer';
import { IDictionary } from '@/interfaces';
import { IReferenceList, IReferenceListIdentifier } from '@/interfaces/referenceList';
import { FormIdentifier, useFormDesignerComponents, useSheshaApplication } from '@/providers';
import { MakePromiseWithState, PromisedValue } from '@/utils/promises';
import { ConfigurationItemsViewMode, IComponentSettings } from '../appConfigurator/models';
import { FormFullName, FormMarkupWithSettings, IFormDto } from '../form/models';
import { isFormFullName, isFormRawId } from '../form/utils';
import { isValidRefListId } from '../referenceListDispatcher/utils';
import {
  CONFIGURATION_ITEMS_LOADER_CONTEXT_INITIAL_STATE,
  ConfigurationItemsLoaderActionsContext,
  ConfigurationItemsLoaderStateContext,
  IClearFormCachePayload,
  IConfigurationItemsLoaderActionsContext,
  IConfigurationItemsLoaderStateContext,
  IGetComponentPayload,
  IGetFormPayload,
  IGetRefListPayload,
  IUpdateComponentPayload,
} from './contexts';
import { IComponentsDictionary, IFormsDictionary, IReferenceListsDictionary } from './models';
import metadataReducer from './reducer';
import { getFormForbiddenMessage, getFormNotFoundMessage, getReferenceListNotFoundMessage } from './utils';
import { migrateFormSettings } from '../form/migration/formSettingsMigrations';
import { SheshaHttpHeaders } from '@/shesha-constants/httpHeaders';

type LocalForage = ReturnType<typeof localForage.createInstance>;
type StoragesDictionary = IDictionary<LocalForage>;

enum ItemTypes {
  ReferenceList = 'ref-lists',
  Form = 'forms',
  Component = 'components',
}

export interface IConfigurationItemsLoaderProviderProps { }

const ConfigurationItemsLoaderProvider: FC<PropsWithChildren<IConfigurationItemsLoaderProviderProps>> = ({
  children,
}) => {
  const initial: IConfigurationItemsLoaderStateContext = {
    ...CONFIGURATION_ITEMS_LOADER_CONTEXT_INITIAL_STATE,
  };

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
  const components = useRef<IComponentsDictionary>({});

  const [state] = useThunkReducer(metadataReducer, initial);

  const { backendUrl, httpHeaders, applicationKey } = useSheshaApplication();

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  const makeRefListLoadingKey = (payload: IGetRefListPayload): string => {
    const { refListId, configurationItemMode } = payload;
    if (!refListId || !refListId.name) return null;

    const addMode = (key: string): string => {
      return `${key}:${configurationItemMode}`;
    };

    return addMode(`${refListId.module}/${refListId.name}`);
  };

  const getMarkupFromResponse = (data: FormConfigurationDto): FormMarkupWithSettings => {
    const markupJson = data.markup;
    return markupJson ? (JSON.parse(markupJson) as FormMarkupWithSettings) : null;
  };

  const getCacheKeyByFullName = (mode: string, module: string, name: string): string => {
    return `${mode}:${module}:${name}`;
  };
  const getCacheKeyByRawId = (mode: string, rawId: string): string => {
    return `${mode}:${rawId}`;
  };

  const getFromCache = <TDto extends any>(itemType: ItemTypes, key: string): Promise<TDto> => {
    const cacheStorage = getStorage(itemType);
    return key
      ? cacheStorage.getItem<TDto>(key).catch((e) => {
        console.warn(`Failed to get from cache, key=${key}`, e);
        return null;
      })
      : Promise.resolve(null);
  };

  const addToCache = (itemType: ItemTypes, cacheKey: string, data: any) => {
    if (!cacheKey) return;

    const cacheStorage = getStorage(itemType);
    if (data) {
      cacheStorage.setItem(cacheKey, data).catch((e) => {
        console.warn(`Failed to cache configuration item with key '${cacheKey}'`, e);
      });
    } else cacheStorage.removeItem(cacheKey);
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
      versionNo: dto.versionNo,
      versionStatus: dto.versionStatus,
      isLastVersion: dto.isLastVersion,

      markup: markupWithSettings?.components,
      settings: markupWithSettings?.formSettings,
    };

    if (result.settings) {
      // there can be string for some old forms
      const rawAccess = result.settings.access ?? dto?.access; // string | number | undefined
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
      result.settings.permissions = result.settings.permissions ?? dto?.permissions ?? [];
    }

    return result;
  };

  const configModeOrDefault = (mode?: ConfigurationItemsViewMode): ConfigurationItemsViewMode => {
    return mode ?? 'live';
  };

  const getFormCacheKey = (formId: FormIdentifier, configurationItemMode?: ConfigurationItemsViewMode): string => {
    return isFormFullName(formId)
      ? getCacheKeyByFullName(configModeOrDefault(configurationItemMode), formId.module, formId.name)
      : isFormRawId(formId)
        ? getCacheKeyByRawId(configModeOrDefault(configurationItemMode), formId)
        : null;
  };

  const getRefListCacheKey = (
    listId: IReferenceListIdentifier,
    configurationItemMode?: ConfigurationItemsViewMode
  ): string => {
    return getCacheKeyByFullName(configModeOrDefault(configurationItemMode), listId.module, listId.name);
  };

  const getRefList = (payload: IGetRefListPayload): PromisedValue<IReferenceList> => {
    // create a key
    const key = makeRefListLoadingKey(payload);

    if (!payload.skipCache) {
      const loadedRefList = referenceLists.current[key];
      if (loadedRefList) return loadedRefList; // TODO: check for rejection
    }

    const { refListId, configurationItemMode } = payload;

    const refListPromise = new Promise<IReferenceList>((resolve, reject) => {
      if (!isValidRefListId(refListId)) reject('Reference List identifier must be specified');

      const cacheKey = getRefListCacheKey(refListId, configurationItemMode);

      getFromCache<IReferenceList>(ItemTypes.ReferenceList, cacheKey).then((cachedDto) => {
        const promise = referenceListGetByName(
          { module: refListId.module, name: refListId.name, md5: cachedDto?.cacheMd5 },
          { base: backendUrl, headers: httpHeaders /*, responseConverter*/ }
        );

        promise
          .then((response) => {
            // TODO: handle not changed
            if (response.success) {
              const responseData = response.result;
              if (!responseData) throw 'Failed to fetch reference list. Response is empty';

              const dto: IReferenceList = {
                name: responseData.name,
                items: [...responseData.items],
              };
              addToCache(ItemTypes.ReferenceList, cacheKey, responseData);

              resolve(dto);
            } else {
              const rawResponse = response as Response;
              if (rawResponse && rawResponse.status === 304) {
                // code 304 indicates that the content ws not modified - use cached value
                resolve(cachedDto);
              } else {
                const httpResponse = response as Response;

                const error = response.error ?? {
                  code: httpResponse?.status,
                  message:
                    httpResponse?.status === 404
                      ? getReferenceListNotFoundMessage(refListId)
                      : httpResponse?.statusText,
                };

                reject(error);
              }
            }
          })
          .catch((e) => {
            reject(e);
          });

        return promise;
      });
    });

    const promiseWithState = MakePromiseWithState(refListPromise);
    referenceLists.current[key] = promiseWithState;

    return promiseWithState;
  };

  const getCachedForm = (payload: IGetFormPayload): Promise<IFormDto> => {
    // create a key
    const key = getFormCacheKey(payload.formId, payload.configurationItemMode);

    if (!payload.skipCache) {
      const loadedForm = forms.current[key];
      if (loadedForm) return loadedForm; // TODO: check for rejection
    }
    return null;
  };

  const getForm = (payload: IGetFormPayload): Promise<IFormDto> => {
    // create a key
    const key = getFormCacheKey(payload.formId, payload.configurationItemMode);

    if (!payload.skipCache) {
      const loadedForm = forms.current[key];
      if (loadedForm) return loadedForm; // TODO: check for rejection
    }

    const { formId, configurationItemMode } = payload;

    const formPromise = new Promise<IFormDto>((resolve, reject) => {
      if (!isFormRawId(formId) && !isFormFullName(formId)) reject('Form identifier must be specified');

      const cacheKey = getFormCacheKey(formId, configurationItemMode);
      const headers = {...httpHeaders, [SheshaHttpHeaders.ConfigItemsMode]: configurationItemMode };      

      getFromCache<FormConfigurationDto>(ItemTypes.Form, cacheKey).then((cachedDto) => {
        const promise = isFormFullName(formId)
          ? formConfigurationGetByName(
            {
              name: formId.name,
              module: formId.module,
              version: formId.version,
              md5: cachedDto?.cacheMd5,
            },
            { base: backendUrl, headers: headers }
          )
          : isFormRawId(formId)
            ? formConfigurationGet(
              { id: formId, md5: cachedDto?.cacheMd5 },
              { base: backendUrl, headers: headers }
            )
            : Promise.reject('Form identifier must be specified');

        promise
          .then((response) => {
            // TODO: handle not changed
            if (response.success) {
              const responseData = response.result;
              if (!responseData) throw 'Failed to fetch form. Response is empty';

              const dto = migrateFormSettings(convertFormConfigurationDto2FormDto(responseData), designerComponents);
              addToCache(ItemTypes.Form, cacheKey, responseData);

              resolve(dto);
            } else {
              const rawResponse = response as Response;
              if (rawResponse && rawResponse.status === 304) {
                // code 304 indicates that the content ws not modified - use cached value
                const dto = migrateFormSettings(convertFormConfigurationDto2FormDto(cachedDto), designerComponents);
                resolve(dto);
              } else {
                const httpResponse = response as Response;

                const error = response.error ?? {
                  code: httpResponse?.status,
                  message: httpResponse?.status === 404
                    ? getFormNotFoundMessage(formId) 
                    : httpResponse?.status === 401 || httpResponse?.status === 403
                      ? getFormForbiddenMessage(formId)
                      : httpResponse?.statusText,
                };

                reject(error);
              }
            }
          })
          .catch((e) => {
            reject(e);
          });
      });
    });
    forms.current[key] = formPromise;

    return formPromise;
  };

  const prefixWithAppKey = (cacheKey: string): string => {
    return cacheKey && applicationKey ? applicationKey + '/' + cacheKey : cacheKey;
  };

  const getComponentCacheKey = (name: string, isApplicationSpecific: boolean): string => {
    const key = name ? `${name.toLowerCase()}` : null;
    return isApplicationSpecific ? prefixWithAppKey(key) : key;
  };

  const clearComponentCache = (name: string) => {
    delete components.current[name.toLocaleLowerCase()];
  };

  const getComponent = (payload: IGetComponentPayload) => {
    if (!payload.name) MakePromiseWithState(Promise.reject('Name must be specified'));

    // create a key
    const key = payload.name.toLowerCase();

    if (!payload.skipCache) {
      const loadedComponent = components.current[key];
      if (loadedComponent) return loadedComponent; // TODO: check for rejection
    }

    const { name, isApplicationSpecific } = payload;

    const componentPromise = new Promise<IComponentSettings>((resolve, reject) => {
      const cacheKey = getComponentCacheKey(payload.name, payload.isApplicationSpecific);
      getFromCache<IComponentSettings>(ItemTypes.Component, cacheKey).then((cachedDto) => {
        const promise = configurableComponentGetByName(
          { name: name, md5: cachedDto?.cacheMd5, isApplicationSpecific },
          { base: backendUrl, headers: httpHeaders /*, responseConverter*/ }
        );

        promise
          .then((response) => {
            // TODO: handle not changed
            if (response.success) {
              const responseData = response.result;
              if (!responseData) throw 'Failed to fetch component. Response is empty';

              const settings = responseData.settings ? JSON.parse(responseData.settings) : null;
              const dto: IComponentSettings = {
                ...responseData,
                settings: settings,
              };
              addToCache(ItemTypes.Component, cacheKey, dto);

              resolve(dto);
            } else {
              const rawResponse = response as Response;
              if (rawResponse && rawResponse.status === 304) {
                // code 304 indicates that the content ws not modified - use cached value
                resolve(cachedDto);
              } else {
                const httpResponse = response as Response;

                const error = response.error ?? {
                  code: httpResponse?.status,
                  message: httpResponse?.status === 404 ? `Component ${name} not found` : httpResponse?.statusText,
                };

                reject(error);
              }
            }
          })
          .catch((e) => {
            reject(e);
          });
      });
    });
    const promiseWithState = MakePromiseWithState(componentPromise);
    components.current[key] = promiseWithState;

    return promiseWithState;
  };

  const updateComponent = (payload: IUpdateComponentPayload) => {
    const jsonSettings = payload.settings ? JSON.stringify(payload.settings) : null;

    return configurableComponentUpdateSettings(
      {
        module: null,
        name: payload.name,
        isApplicationSpecific: payload.isApplicationSpecific,
        settings: jsonSettings,
      },
      { base: backendUrl, headers: httpHeaders }
    ).then((response) => {
      clearComponentCache(payload.name);
      return response;
    });
  };

  const clearFormCache = (payload: IClearFormCachePayload) => {
    const modes: ConfigurationItemsViewMode[] = ['live', 'ready', 'latest'];
    modes.forEach((mode) => {
      const cacheKey = getFormCacheKey(payload.formId, mode);

      delete forms.current[cacheKey];
    });
  };

  const getEntityFormId = (className: string, formType: string) => {
    return new Promise<FormFullName>((resolve) => {
      entityConfigGetEntityConfigForm(
        { entityConfigName: className, typeName: formType },
        { base: backendUrl, headers: httpHeaders }
      ).then((response) => {
        if (response.success) resolve({ name: response.result.name, module: response.result.module });
      });
    });
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
    <ConfigurationItemsLoaderStateContext.Provider value={state}>
      <ConfigurationItemsLoaderActionsContext.Provider value={loaderActions}>
        {children}
      </ConfigurationItemsLoaderActionsContext.Provider>
    </ConfigurationItemsLoaderStateContext.Provider>
  );
};

function useConfigurationItemsLoaderState(require: boolean) {
  const context = useContext(ConfigurationItemsLoaderStateContext);

  if (context === undefined && require) {
    throw new Error('useConfigurationItemsLoaderState must be used within a ConfigurationItemsLoaderProvider');
  }

  return context;
}

function useConfigurationItemsLoaderActions(require: boolean) {
  const context = useContext(ConfigurationItemsLoaderActionsContext);

  if (context === undefined && require) {
    throw new Error('useConfigurationItemsLoaderActions must be used within a ConfigurationItemsLoaderProvider');
  }

  return context;
}

function useConfigurationItemsLoader(require: boolean = true) {
  const actionsContext = useConfigurationItemsLoaderActions(require);
  const stateContext = useConfigurationItemsLoaderState(require);

  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
}

export {
  ConfigurationItemsLoaderProvider,
  useConfigurationItemsLoader,
  useConfigurationItemsLoaderActions,
  useConfigurationItemsLoaderState,
};
