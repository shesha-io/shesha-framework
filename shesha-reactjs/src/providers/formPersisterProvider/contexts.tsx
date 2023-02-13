import { createContext } from 'react';
import { IErrorInfo } from '../../interfaces/errorInfo';
import {
  DEFAULT_FORM_SETTINGS,
  FormIdentifier,
  FormMarkupWithSettings,
  FormRawMarkup,
  IFormSettings,
} from '../form/models';
import { IPersistedFormProps } from './models';

export interface IFormPersisterStateContext {
  formId: FormIdentifier;
  skipCache: boolean;
  formProps: IPersistedFormProps;
  formSettings: IFormSettings;
  markup: FormRawMarkup;
  loaded: boolean;
  loading: boolean;
  loadError?: IErrorInfo;
  saving: boolean;
  saved: boolean;
  saveError?: IErrorInfo;
}

export interface ILoadRequestPayload {
  formId: FormIdentifier;
}

export interface ILoadFormPayload {
  skipCache: boolean;
}

export interface IFormPersisterActionsContext {
  loadForm: (payload: ILoadFormPayload) => void;
  saveForm: (payload: FormMarkupWithSettings) => Promise<void>;
  updateFormSettings: (settings: IFormSettings) => void;
}

/** Form initial state */
export const FORM_PERSISTER_CONTEXT_INITIAL_STATE: IFormPersisterStateContext = {
  formId: null,
  skipCache: false,
  markup: null,
  formSettings: DEFAULT_FORM_SETTINGS,
  formProps: null,
  loaded: false,
  loading: false,
  saved: false,
  saving: false,
};

export const FormPersisterStateContext = createContext<IFormPersisterStateContext>(FORM_PERSISTER_CONTEXT_INITIAL_STATE);

export const FormPersisterActionsContext = createContext<IFormPersisterActionsContext>(undefined);

export const FormPersisterStateConsumer = FormPersisterStateContext.Consumer;
