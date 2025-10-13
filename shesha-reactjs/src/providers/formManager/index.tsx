import React, { FC, PropsWithChildren, useContext, useRef } from 'react';
import { FormManagerActionsContext, GetFormByIdPayload, GetFormByMarkupPayload, IFormManagerActionsContext } from './contexts';
import { FormLoadingItem, FormsCache, UpToDateForm } from './interfaces';
import { getFormCacheKey } from '@/utils/form';
import { useFormDesignerComponents } from '../form/hooks';
import { useConfigurationItemsLoader } from '../configurationItemsLoader';
import { convertFormMarkupToFlatStructure } from '../form/utils';
import { DEFAULT_FORM_SETTINGS, IFormSettings } from '../form/models';
import { useFormById, useFormByMarkup } from './hooks';
import { migrateFormSettings } from '../form/migration/formSettingsMigrations';

/**
 * FormManager. Component responsible for preparation of forms and caching.
 * Make all required preparation of the form markup including upgrade of components and conversion to a flat structure.
 */
export const FormManager: FC<PropsWithChildren> = ({ children }) => {
  const cacheById = useRef<FormsCache>({});
  const cacheByMarkup = useRef<FormsCache>({});
  const designerComponents = useFormDesignerComponents();
  const { getForm } = useConfigurationItemsLoader();

  const getFormByIdAsync = async ({ formId, skipCache }: GetFormByIdPayload): Promise<UpToDateForm> => {
    const formDto = await getForm({ formId, skipCache });
    const { markup, settings = DEFAULT_FORM_SETTINGS } = formDto;
    const flatStructure = convertFormMarkupToFlatStructure(markup, settings, designerComponents);

    const result: UpToDateForm = {
      id: formDto.id,
      name: formDto.name,
      ...formDto,
      flatStructure,
      settings: settings,
    };

    return result;
  };

  const makeFormByIdLoader = (payload: GetFormByIdPayload): FormLoadingItem => {
    const item: FormLoadingItem = {
      state: 'loading',
      promise: getFormByIdAsync(payload).then((response) => {
        item.state = 'ready';
        item.form = response;
        return response;
      }).catch((error) => {
        item.state = 'error';
        item.error = error;
        throw error;
      }),
    };

    return item;
  };

  const getFormByIdLoader = (payload: GetFormByIdPayload): FormLoadingItem => {
    const cacheKey = getFormCacheKey(payload.formId);

    if (!payload.skipCache) {
      const cachedItem = cacheById.current[cacheKey];
      if (cachedItem)
        return cachedItem;
    }

    const item = makeFormByIdLoader(payload);

    cacheById.current[cacheKey] = item;

    return item;
  };

  const getFormById = (payload: GetFormByIdPayload): Promise<UpToDateForm> => {
    return getFormByIdLoader(payload).promise;
  };

  const getFormByMarkupAsync = ({ markup, formSettings = DEFAULT_FORM_SETTINGS, isSettingsForm: convertToSettings }: GetFormByMarkupPayload): Promise<UpToDateForm> => {
    const settings: IFormSettings = convertToSettings
      ? { ...formSettings, isSettingsForm: true }
      : formSettings;

    const upToDateForm = migrateFormSettings({ markup, settings }, designerComponents);
    const flatStructure = convertFormMarkupToFlatStructure(upToDateForm.markup, upToDateForm.settings, designerComponents);

    const result: UpToDateForm = {
      flatStructure,
      settings: upToDateForm.settings,
    };
    return Promise.resolve(result);
  };

  const makeFormByMarkupLoader = (payload: GetFormByMarkupPayload): FormLoadingItem => {
    const item: FormLoadingItem = {
      state: 'loading',
      promise: getFormByMarkupAsync(payload).then((response) => {
        item.state = 'ready';
        item.form = response;
        return response;
      }).catch((error) => {
        item.state = 'error';
        item.error = error;
        throw error;
      }),
    };

    return item;
  };

  const getFormByMarkupLoader = (payload: GetFormByMarkupPayload): FormLoadingItem => {
    const cacheKey = payload.key;
    if (!cacheKey) {
      // console.warn('Form markup key is not defined');
      return makeFormByMarkupLoader(payload);
    }

    const cachedItem = cacheByMarkup.current[payload.key];
    if (cachedItem)
      return cachedItem;

    const item = makeFormByMarkupLoader(payload);

    cacheByMarkup.current[cacheKey] = item;

    return item;
  };

  const getFormByMarkup = (payload: GetFormByMarkupPayload): Promise<UpToDateForm> => {
    return getFormByMarkupLoader(payload).promise;
  };

  const actions: IFormManagerActionsContext = {
    getFormById,
    getFormByIdLoader,
    getFormByMarkup,
    getFormByMarkupLoader,
  };

  return (
    <FormManagerActionsContext.Provider value={actions}>
      {children}
    </FormManagerActionsContext.Provider>
  );
};

const useFormManager = (): IFormManagerActionsContext => {
  const context = useContext(FormManagerActionsContext);

  if (context === undefined) {
    throw new Error('useFormManager must be used within a FormManager');
  }

  return context;
};

export { useFormManager, useFormByMarkup, useFormById };
