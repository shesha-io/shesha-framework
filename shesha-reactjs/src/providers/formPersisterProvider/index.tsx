import React, { FC, PropsWithChildren, useContext, useEffect } from 'react';
import { FormUpdateMarkupInput, formConfigurationUpdateMarkup } from '@/apis/formConfiguration';
import useThunkReducer from '@/hooks/thunkReducer';
import { useAppConfigurator, useSheshaApplication } from '@/providers';
import { useConfigurationItemsLoader } from '@/providers/configurationItemsLoader';
import {
  FormIdentifier,
  FormMarkupWithSettings,
  IFormSettings,
} from '../form/models';
import {
  loadErrorAction,
  loadRequestAction,
  loadSuccessAction,
  saveErrorAction,
  saveRequestAction,
  saveSuccessAction,
  updateFormSettingsAction,
} from './actions';
import {
  FORM_PERSISTER_CONTEXT_INITIAL_STATE,
  FormPersisterActionsContext,
  FormPersisterStateConsumer,
  FormPersisterStateContext,
  IFormPersisterActionsContext,
  IFormPersisterContext,
  IFormPersisterStateContext,
  ILoadFormPayload,
} from './contexts';
import formReducer from './reducer';
import { useFormManager } from '../formManager';

export interface IFormProviderProps {
  formId: FormIdentifier;
  skipCache?: boolean;
}

const FormPersisterProvider: FC<PropsWithChildren<IFormProviderProps>> = ({ children, formId, skipCache = false }) => {
  const initial: IFormPersisterStateContext = {
    ...FORM_PERSISTER_CONTEXT_INITIAL_STATE,
    formId: formId,
    skipCache: skipCache,
  };

  const [state, dispatch] = useThunkReducer(formReducer, initial);

  const { clearFormCache } = useConfigurationItemsLoader();
  const { getFormById } = useFormManager();
  const { configurationItemMode } = useAppConfigurator();
  const { backendUrl, httpHeaders } = useSheshaApplication();

  const doFetchFormInfo = (payload: ILoadFormPayload) => {
    if (formId) {
      dispatch(loadRequestAction({ formId }));

      getFormById({ formId, configurationItemMode: configurationItemMode, skipCache: payload.skipCache })
        .then((form) => {
          dispatch((dispatchThunk, _getState) => {
            dispatchThunk(loadSuccessAction(form));
          });
        })
        .catch((e) => {
          dispatch(loadErrorAction(e));
        });
    }
  };

  useEffect(() => {
    if (!formId) return;

    doFetchFormInfo({ skipCache: state.skipCache });
  }, [formId]);

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  const loadForm = (payload: ILoadFormPayload) => {
    doFetchFormInfo(payload);
  };

  const saveForm = async (payload: FormMarkupWithSettings): Promise<void> => {
    if (!state.formProps?.id) return Promise.reject();

    dispatch(saveRequestAction());

    const dto: FormUpdateMarkupInput = {
      id: state.formProps.id,
      markup: JSON.stringify(payload),
      access: payload.formSettings.access,
      permissions: payload.formSettings.permissions,
    };

    await formConfigurationUpdateMarkup(dto, { base: backendUrl, headers: httpHeaders })
      .then((_response) => {
        // clear cache
        clearFormCache({ formId: state.formId });

        dispatch(saveSuccessAction());
        return Promise.resolve();
      })
      .catch((error) => {
        dispatch(saveErrorAction(error));
        return Promise.reject();
      });
  };

  const updateFormSettings = (settings: IFormSettings) => {
    dispatch(updateFormSettingsAction(settings));
  };

  const formPersisterActions: IFormPersisterActionsContext = {
    loadForm,
    saveForm,
    updateFormSettings,
    /* NEW_ACTION_GOES_HERE */
  };

  return (
    <FormPersisterStateContext.Provider value={state}>
      <FormPersisterActionsContext.Provider value={formPersisterActions}>
        {children}
      </FormPersisterActionsContext.Provider>
    </FormPersisterStateContext.Provider>
  );
};

function useFormPersisterState(require: boolean = true) {
  const context = useContext(FormPersisterStateContext);

  if (require && context === undefined) {
    throw new Error('useFormPersisterState must be used within a FormPersisterProvider');
  }

  return context;
}

function useFormPersisterActions(require: boolean = true) {
  const context = useContext(FormPersisterActionsContext);

  if (require && context === undefined) {
    throw new Error('useFormPersisterActions must be used within a FormPersisterProvider');
  }

  return context;
}

const useFormPersisterIfAvailable = (require: boolean = false): IFormPersisterContext | undefined => {
  const actionsContext = useFormPersisterActions(require);
  const stateContext = useFormPersisterState(require);

  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
};

const useFormPersister = (): IFormPersisterContext => useFormPersisterIfAvailable(true)!;

export { FormPersisterStateConsumer as FormPersisterConsumer, FormPersisterProvider, useFormPersister, useFormPersisterIfAvailable };
