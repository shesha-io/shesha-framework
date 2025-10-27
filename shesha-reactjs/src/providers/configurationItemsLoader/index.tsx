import React, { FC, PropsWithChildren, useContext } from 'react';
import { FormIdFullNameDtoAjaxResponse } from '@/apis/entityConfig';
import { useFormDesignerComponents, useHttpClient } from '@/providers';
import { PromisedValue } from '@/utils/promises';
import { FormFullName, FormMarkupWithSettings, IFormDto } from '../form/models';
import {
  ConfigurationItemsLoaderActionsContext,
  IClearFormCachePayload,
  IConfigurationItemsLoaderActionsContext,
  IGetComponentPayload,
  IGetFormPayload,
  IGetRefListPayload,
  IUpdateComponentPayload,
} from './contexts';
import { FormConfigurationDto, ReferenceListDto } from './models';
import { migrateFormSettings } from '../form/migration/formSettingsMigrations';
import { extractAjaxResponse } from '@/interfaces/ajaxResponse';
import { buildUrl } from '@/utils/url';
import { IComponentSettings } from '../appConfigurator/models';
import { ConfigurationLoader, IConfigurationLoader } from './configurationLoader';
import { useCacheProvider } from '@/hooks/useCache';
import { useRefInitialized } from '@/hooks';

export const URLS = {
  GET_CURRENT_CONFIG: '/api/services/app/ConfigurationItem/GetCurrent',
  GET_CONFIG: '/api/services/app/ConfigurationItem/Get',
  GET_ENTITY_CONFIG_FORM: '/api/services/app/EntityConfig/GetEntityConfigForm',
};

enum ConfigurationType {
  ReferenceList = 'reference-list',
  Form = 'form',
}

const ConfigurationItemsLoaderProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const httpClient = useHttpClient();

  const designerComponents = useFormDesignerComponents();

  const getMarkupFromResponse = (data: FormConfigurationDto): FormMarkupWithSettings | null => {
    const markupJson = data.markup;
    return markupJson ? (JSON.parse(markupJson) as FormMarkupWithSettings) : null;
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
      result.settings.permissions = result.settings.permissions ?? dto.permissions;
    }

    return result;
  };

  const getComponent = (_payload: IGetComponentPayload): PromisedValue<IComponentSettings> => {
    throw new Error('Not implemented');
  };

  const updateComponent = (_payload: IUpdateComponentPayload): Promise<void> => {
    throw new Error('Not implemented');
  };

  const getEntityFormId = async (className: string, formType: string): Promise<FormFullName> => {
    const url = buildUrl(URLS.GET_ENTITY_CONFIG_FORM, { entityConfigName: className, typeName: formType });

    const response = await httpClient.get<FormIdFullNameDtoAjaxResponse>(url);
    const dto = extractAjaxResponse(response.data);
    return { name: dto.name, module: dto.module };
  };

  const cacheProvider = useCacheProvider();

  const loader = useRefInitialized<IConfigurationLoader>(() => new ConfigurationLoader({
    httpClient,
    cacheProvider,
  })).current;

  const getForm = async (payload: IGetFormPayload): Promise<IFormDto> => {
    const form = await loader.getCurrentConfigAsync({ type: ConfigurationType.Form, id: payload.formId, skipCache: payload.skipCache });
    const formDto = form as FormConfigurationDto;
    const dto = migrateFormSettings(convertFormConfigurationDto2FormDto(formDto), designerComponents);
    return dto;
  };

  const getRefList = (payload: IGetRefListPayload): PromisedValue<ReferenceListDto> => {
    const promise = loader.getCurrentConfigAsync<ReferenceListDto>({ type: ConfigurationType.ReferenceList, id: payload.refListId, skipCache: payload.skipCache });
    return promise;
  };

  const clearFormCache = (payload: IClearFormCachePayload): void => {
    loader.clearCacheAsync(ConfigurationType.Form, payload.formId);
  };

  const loaderActions: IConfigurationItemsLoaderActionsContext = {
    getForm: getForm,
    clearFormCache,
    getRefList,
    getComponent,
    updateComponent,
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
