import { IErrorInfo } from '@/interfaces/errorInfo';
import { CrudMode } from './models';
import { createNamedContext } from '@/utils/react';

export interface ICrudStateContext {
  id?: string | undefined;
  isNewObject: boolean;
  allowEdit: boolean;
  allowDelete: boolean;
  mode: CrudMode;
  initialValuesLoading: boolean;
  initialValues?: object | undefined;
  allowChangeMode: boolean;

  autoSave: boolean;
  isSaving: boolean;
  saveError?: IErrorInfo | undefined;

  isDeleting: boolean;
  deletingError?: IErrorInfo | undefined;
}

export interface ICrudActionsContext {
  switchMode: (mode: CrudMode) => void;
}

export interface ICrudContext extends ICrudStateContext, ICrudActionsContext {
  performUpdate: () => Promise<void>;
  performCreate: () => Promise<void>;
  performDelete: () => Promise<void>;
  reset: () => Promise<void>;
  getInitialData: () => object | undefined;
  getFormData: () => object;
}

/** initial state */
export const CRUD_CONTEXT_INITIAL_STATE: ICrudStateContext = {
  isNewObject: false,
  allowEdit: true,
  allowDelete: true,
  mode: 'read',
  initialValuesLoading: false,
  allowChangeMode: true,
  autoSave: false,
  isSaving: false,
  isDeleting: false,
};

export const CrudContext = createNamedContext<ICrudContext | undefined>(undefined, "CrudContext");
