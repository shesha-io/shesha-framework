import React, { FC, PropsWithChildren, useCallback, useContext, useEffect } from 'react';
import { FormUpdateMarkupInput, formConfigurationUpdateMarkup } from '@/apis/formConfiguration';
import useThunkReducer from '@/hooks/thunkReducer';
import { useSheshaApplication } from '@/providers';
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
  resetAction,
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
import { toErrorInfo } from '@/interfaces';

export interface IFormProviderProps {
  formId: FormIdentifier;
  skipCache?: boolean;
}

const FormPersisterProvider: FC<PropsWithChildren<IFormProviderProps>> = ({ children, formId, skipCache = false }) => {
  const initial: IFormPersisterStateContext = {
    ...FORM_PERSISTER_CONTEXT_INITIAL_STATE,
    formId: formId,
  };

  const [state, dispatch] = useThunkReducer(formReducer, initial);

  const { clearFormCache } = useConfigurationItemsLoader();
  const { getFormById } = useFormManager();
  const { backendUrl, httpHeaders } = useSheshaApplication();

  const doFetchFormInfo = useCallback((formId: FormIdentifier, skipCache: boolean): void => {
    if (formId) {
      dispatch(loadRequestAction({ formId }));

      getFormById({ formId, skipCache: skipCache })
        .then((form) => {
          dispatch((dispatchThunk, _getState) => {
            dispatchThunk(loadSuccessAction(form));
          });
        })
        .catch((e) => {
          dispatch(loadErrorAction(toErrorInfo(e)));
        });
    } else
      dispatch(resetAction());
  }, [dispatch, getFormById]);

  useEffect(() => {
    if (!formId) return;

    doFetchFormInfo(formId, skipCache);
  }, [formId, skipCache, doFetchFormInfo]);

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  const loadForm = (payload: ILoadFormPayload): void => {
    doFetchFormInfo(formId, payload.skipCache);
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
        dispatch(saveErrorAction(toErrorInfo(error)));
        return Promise.reject();
      });
  };

  const updateFormSettings = (settings: IFormSettings): void => {
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

function useFormPersisterState(require: boolean = true): IFormPersisterStateContext | undefined {
  const context = useContext(FormPersisterStateContext);

  if (require && context === undefined) {
    throw new Error('useFormPersisterState must be used within a FormPersisterProvider');
  }

  return context;
}

function useFormPersisterActions(require: boolean = true): IFormPersisterActionsContext | undefined {
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
