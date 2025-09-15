import { IErrorInfo } from '@/interfaces/errorInfo';
import {
  FormIdentifier,
  FormMarkupWithSettings,
  IFormSettings,
} from '../form/models';
import { UpToDateForm } from '../formManager/interfaces';
import { createNamedContext } from '@/utils/react';

export interface IFormPersisterStateContext {
  formId: FormIdentifier;
  skipCache: boolean;
  formProps: UpToDateForm;
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
  formProps: null,
  loaded: false,
  loading: false,
  saved: false,
  saving: false,
};

export const FormPersisterStateContext = createNamedContext<IFormPersisterStateContext>(
  FORM_PERSISTER_CONTEXT_INITIAL_STATE,
  "FormPersisterStateContext"
);

export type IFormPersisterContext = IFormPersisterActionsContext & IFormPersisterStateContext;

export const FormPersisterActionsContext = createNamedContext<IFormPersisterActionsContext>(undefined, "FormPersisterActionsContext");

export const FormPersisterStateConsumer = FormPersisterStateContext.Consumer;
