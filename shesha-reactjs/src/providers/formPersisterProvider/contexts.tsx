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
  formProps: UpToDateForm | null;
  loaded: boolean;
  loading: boolean;
  loadError?: IErrorInfo | undefined;
  saving: boolean;
  saved: boolean;
  saveError?: IErrorInfo | undefined;
}

export interface ILoadRequestPayload {
  formId: FormIdentifier;
}

export interface ILoadFormPayload {
  skipCache: boolean;
}

export interface IFormPersisterActionsContext {
  loadForm: (payload: ILoadFormPayload) => Promise<UpToDateForm>;
  saveForm: (payload: FormMarkupWithSettings) => Promise<void>;
  updateFormSettings: (settings: IFormSettings) => void;
}

export const FormPersisterStateContext = createNamedContext<IFormPersisterStateContext | undefined>(
  undefined,
  "FormPersisterStateContext",
);

export type IFormPersisterContext = IFormPersisterActionsContext & IFormPersisterStateContext;

export const FormPersisterActionsContext = createNamedContext<IFormPersisterActionsContext | undefined>(undefined, "FormPersisterActionsContext");
