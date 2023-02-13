import React, { FC, useContext, PropsWithChildren, useRef } from 'react';
import metadataReducer from './reducer';
import {
  ConfigurationItemsLoaderActionsContext,
  ConfigurationItemsLoaderStateContext,
  CONFIGURATION_ITEMS_LOADER_CONTEXT_INITIAL_STATE,
  IConfigurationItemsLoaderStateContext,
  IConfigurationItemsLoaderActionsContext,
  IGetFormPayload,
  IClearFormCachePayload,
  IGetRefListPayload,
  IGetComponentPayload,
  IUpdateComponentPayload,
} from './contexts';
import useThunkReducer from 'react-hook-thunk-reducer';
import { IComponentsDictionary, IFormsDictionary, IReferenceListsDictionary } from './models';
import { FormIdentifier, useSheshaApplication } from '../../providers';
import { asFormFullName, asFormRawId } from '../form/utils';
import { FormMarkupWithSettings, IFormDto, FormFullName } from '../form/models';
import { FormConfigurationDto, formConfigurationGet, formConfigurationGetByName } from '../../apis/formConfiguration';
import { getFormNotFoundMessage, getReferenceListNotFoundMessage } from './utils';
import { ConfigurationItemsViewMode, IComponentSettings } from '../appConfigurator/models';
import { IReferenceList } from '../../interfaces/referenceList';
import { referenceListGetByName } from '../../apis/referenceList';
import { configurableComponentGetByName, useConfigurableComponentUpdateSettings } from '../../apis/configurableComponent';
import { MakePromiseWithState, PromisedValue } from '../../utils/promises';
import { isValidRefListId } from '../referenceListDispatcher/utils';
import { IReferenceListIdentifier } from '../referenceListDispatcher/models';
import { entityConfigGetEntityConfigForm } from '../../apis/entityConfig';
import localForage from 'localforage';
import { IDictionary } from '../../components/configurationFramework/models';

type LocalForage = ReturnType<typeof localForage.createInstance>;
type StoragesDictionary = IDictionary<LocalForage>;

enum ItemTypes {
  ReferenceList = 'ref-lists',
  Form = 'forms',
  Component = 'components',
}

export interface IConfigurationItemsLoaderProviderProps { }

const ConfigurationItemsLoaderProvider: FC<PropsWithChildren<IConfigurationItemsLoaderProviderProps>> = ({ children }) => {
  const initial: IConfigurationItemsLoaderStateContext = {
    ...CONFIGURATION_ITEMS_LOADER_CONTEXT_INITIAL_STATE,
  };

  const storages = useRef<StoragesDictionary>({});
  const getStorage = (name: string): LocalForage => {
    if (!storages.current[name]) {
      storages.current[name] = localForage.createInstance({ name: name });
    }

    return storages.current[name];
  }

  const forms = useRef<IFormsDictionary>({});
  const referenceLists = useRef<IReferenceListsDictionary>({});
  const components = useRef<IComponentsDictionary>({});

  const [state, _dispatch] = useThunkReducer(metadataReducer, initial);

  const { backendUrl, httpHeaders, applicationKey } = useSheshaApplication();

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  const makeRefListLoadingKey = (payload: IGetRefListPayload): string => {
    const { refListId, configurationItemMode } = payload;
    if (!refListId || !refListId.name)
      return null;

    const addMode = (key: string): string => {
      return `${key}:${configurationItemMode}`
    }

    return addMode(`${refListId.module}/${refListId.name}`);
  }

  const makeFormLoadingKey = (payload: IGetFormPayload): string => {
    const { formId, configurationItemMode } = payload;

    const addMode = (key: string): string => {
      return `${key}:${configurationItemMode}`
    }

    const rawId = asFormRawId(formId);
    if (rawId) {
      return addMode(rawId);
    }

    const fullName = asFormFullName(formId);
    if (fullName) {
      return addMode(`${fullName.module}/${fullName.name}`);
    }
    return null;
  }

  const getMarkupFromResponse = (data: FormConfigurationDto): FormMarkupWithSettings => {
    const markupJson = data.markup;
    return markupJson
      ? JSON.parse(markupJson) as FormMarkupWithSettings
      : null;
  }

  const getCacheKeyByFullName = (mode: string, module: string, name: string): string => {
    return `${mode}:${module}:${name}`;
  }
  const getCacheKeyByRawId = (mode: string, rawId: string): string => {
    return `${mode}:${rawId}`;
  }

  const getFromCache = <TDto extends any>(itemType: ItemTypes, key: string): Promise<TDto> => {
    const cacheStorage = getStorage(itemType);
    return key
      ? cacheStorage.getItem<TDto>(key).catch(e => {
        console.warn(`Failed to get from cache, key=${key}`, e);
        return null;
      })
      : Promise.resolve(null);
  }

  const addToCache = (itemType: ItemTypes, cacheKey: string, data: any) => {
    if (!cacheKey)
      return;

    const cacheStorage = getStorage(itemType);
    if (data) {
      cacheStorage.setItem(cacheKey, data).catch(e => {
        console.warn(`Failed to cache configuration item with key '${cacheKey}'`, e);
      });
    }
    else
      cacheStorage.removeItem(cacheKey);
  }

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
    return result;
  };

  const configModeOrDefault = (mode?: ConfigurationItemsViewMode): ConfigurationItemsViewMode => {
    return mode ?? 'live';
  }

  const getFormCacheKey = (formId: FormIdentifier, configurationItemMode?: ConfigurationItemsViewMode): string => {
    const rawId = asFormRawId(formId);
    const fullName = asFormFullName(formId);
    return fullName
      ? getCacheKeyByFullName(configModeOrDefault(configurationItemMode), fullName.module, fullName.name)
      : rawId
        ? getCacheKeyByRawId(configModeOrDefault(configurationItemMode), rawId)
        : null;
  }

  const getRefListCacheKey = (listId: IReferenceListIdentifier, configurationItemMode?: ConfigurationItemsViewMode): string => {
    return getCacheKeyByFullName(configModeOrDefault(configurationItemMode), listId.module, listId.name);
  }

  const getRefList = (payload: IGetRefListPayload): PromisedValue<IReferenceList> => {
    // create a key
    const key = makeRefListLoadingKey(payload);

    if (!payload.skipCache) {
      const loadedRefList = referenceLists.current[key];
      if (loadedRefList) return loadedRefList; // todo: check for rejection
    }

    const { refListId, configurationItemMode } = payload;

    const refListPromise = new Promise<IReferenceList>((resolve, reject) => {
      if (!isValidRefListId(refListId))
        reject("Reference List identifier must be specified");

      const cacheKey = getRefListCacheKey(refListId, configurationItemMode);

      getFromCache<IReferenceList>(ItemTypes.ReferenceList, cacheKey).then(cachedDto => {
        const promise = referenceListGetByName({ module: refListId.module, name: refListId.name, md5: cachedDto?.cacheMd5 }, { base: backendUrl, headers: httpHeaders/*, responseConverter*/ });

        promise.then(response => {
          // todo: handle not changed
          if (response.success) {
            const responseData = response.result;
            if (!responseData)
              throw 'Failed to fetch reference list. Response is empty';

            const dto: IReferenceList = {
              name: responseData.name,
              items: [...responseData.items]
            };
            addToCache(ItemTypes.ReferenceList, cacheKey, responseData)

            resolve(dto);
          } else {
            const rawResponse = response as Response;
            if (rawResponse && rawResponse.status === 304) {
              // code 304 indicates that the content ws not modified - use cached value
              resolve(cachedDto);
            } else {
              const httpResponse = response as Response;

              const error = response.error ?? { code: httpResponse?.status, message: httpResponse?.status === 404 ? getReferenceListNotFoundMessage(refListId) : httpResponse?.statusText };

              reject(error);
            }
          }
        })
          .catch(e => {
            reject(e);
          });

        return promise;
      });
    });

    const promiseWithState = MakePromiseWithState(refListPromise);
    referenceLists.current[key] = promiseWithState;

    return promiseWithState;
  }

  const getForm = (payload: IGetFormPayload): Promise<IFormDto> => {
    // create a key
    const key = makeFormLoadingKey(payload);

    if (!payload.skipCache) {
      const loadedForm = forms.current[key];
      if (loadedForm) return loadedForm; // todo: check for rejection
    }

    const { formId, configurationItemMode } = payload;
    const rawId = asFormRawId(formId);
    const fullName = asFormFullName(formId);

    const formPromise = new Promise<IFormDto>((resolve, reject) => {
      if (!rawId && !fullName)
        reject("Form identifier must be specified");

      const cacheKey = getFormCacheKey(formId, configurationItemMode);

      getFromCache<FormConfigurationDto>(ItemTypes.Form, cacheKey).then(cachedDto => {
        const promise = Boolean(fullName)
          ? formConfigurationGetByName({ name: fullName.name, module: fullName.module, version: fullName.version, md5: cachedDto?.cacheMd5 }, { base: backendUrl, headers: httpHeaders/*, responseConverter*/ })
          : Boolean(rawId)
            ? formConfigurationGet({ id: rawId, md5: cachedDto?.cacheMd5 }, { base: backendUrl, headers: httpHeaders/*, responseConverter*/ })
            : Promise.reject("Form identifier must be specified");

        promise.then(response => {
          // todo: handle not changed
          if (response.success) {
            const responseData = response.result;
            if (!responseData)
              throw 'Failed to fetch form. Response is empty';

            const dto = convertFormConfigurationDto2FormDto(responseData);
            addToCache(ItemTypes.Form, cacheKey, responseData);

            resolve(dto);
          } else {
            const rawResponse = response as Response;
            if (rawResponse && rawResponse.status === 304) {
              // code 304 indicates that the content ws not modified - use cached value
              const dto = convertFormConfigurationDto2FormDto(cachedDto);
              resolve(dto);
            } else {
              const httpResponse = response as Response;

              const error = response.error ?? { code: httpResponse?.status, message: httpResponse?.status === 404 ? getFormNotFoundMessage(formId) : httpResponse?.statusText };

              reject(error);
            }
          }
        })
          .catch(e => {
            reject(e);
          });
      });
    });
    forms.current[key] = formPromise;

    return formPromise;
  };

  const prefixWithAppKey = (cacheKey: string): string => {
    return cacheKey && applicationKey
      ? applicationKey + '/' + cacheKey
      : cacheKey;
  }

  const getComponentCacheKey = (name: string, isApplicationSpecific: boolean): string => {
    const key = name ? `${name.toLowerCase()}` : null;
    return isApplicationSpecific
      ? prefixWithAppKey(key)
      : key;
  }

  const clearComponentCache = (name: string) => {
    delete components.current[name.toLocaleLowerCase()];
  }

  const getComponent = (payload: IGetComponentPayload) => {

    if (!payload.name)
      MakePromiseWithState(Promise.reject("Name must be specified"));

    // create a key
    const key = payload.name.toLowerCase();

    if (!payload.skipCache) {
      const loadedComponent = components.current[key];
      if (loadedComponent) return loadedComponent; // todo: check for rejection
    }

    const { name, isApplicationSpecific } = payload;

    const componentPromise = new Promise<IComponentSettings>((resolve, reject) => {
      const cacheKey = getComponentCacheKey(payload.name, payload.isApplicationSpecific);
      getFromCache<IComponentSettings>(ItemTypes.Component, cacheKey).then(cachedDto => {
        const promise = configurableComponentGetByName({ name: name, md5: cachedDto?.cacheMd5, isApplicationSpecific }, { base: backendUrl, headers: httpHeaders/*, responseConverter*/ });

        promise.then(response => {
          // todo: handle not changed
          if (response.success) {
            const responseData = response.result;
            if (!responseData)
              throw 'Failed to fetch component. Response is empty';

            const settings = responseData.settings
              ? JSON.parse(responseData.settings)
              : null;
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

              const error = response.error ?? { code: httpResponse?.status, message: httpResponse?.status === 404 ? `Component ${name} not found` : httpResponse?.statusText };

              reject(error);
            }
          }
        })
          .catch(e => {
            reject(e);
          });
      });
    });
    const promiseWithState = MakePromiseWithState(componentPromise);
    components.current[key] = promiseWithState;

    return promiseWithState;
  }

  const { mutate: updateComponentSettings } = useConfigurableComponentUpdateSettings({});
  const updateComponent = (payload: IUpdateComponentPayload) => {
    const jsonSettings = payload.settings
      ? JSON.stringify(payload.settings)
      : null;
    return updateComponentSettings({
      module: null,
      name: payload.name,
      isApplicationSpecific: payload.isApplicationSpecific,
      settings: jsonSettings
    }).then(response => {
      clearComponentCache(payload.name);
      return response;
    });
  }

  const clearFormCache = (payload: IClearFormCachePayload) => {
    const modes: ConfigurationItemsViewMode[] = ['live', 'ready', 'latest'];
    modes.forEach(mode => {
      const cacheKey = getFormCacheKey(payload.formId, mode);

      delete forms.current[cacheKey];
    });
  }

  const getEntityFormId = (className: string, formType: string, action: (formId: FormFullName) => void) => {
    entityConfigGetEntityConfigForm({ entityConfigName: className, typeName: formType }, { base: backendUrl })
      .then(response => {
        if (response.success)
          action({ name: response.result.name, module: response.result.module });
      });
  }

  const loaderActions: IConfigurationItemsLoaderActionsContext = {
    getForm,
    getRefList,
    getComponent,
    updateComponent,
    clearFormCache,
    getEntityFormId
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

export { ConfigurationItemsLoaderProvider, useConfigurationItemsLoaderState, useConfigurationItemsLoaderActions, useConfigurationItemsLoader };
