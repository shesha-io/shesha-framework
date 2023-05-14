import { IErrorInfo } from 'interfaces/errorInfo';
import { createContext } from 'react';
import { CrudMode } from './models';

export interface ICrudStateContext {
  isNewObject: boolean;
  allowEdit: boolean;
  allowDelete: boolean;
  mode: CrudMode;
  initialValuesLoading: boolean;
  initialValues?: object;
  allowChangeMode: boolean;
  
  autoSave: boolean;
  isSaving: boolean;
  saveError?: IErrorInfo;

  isDeleting: boolean;
  deletingError?: IErrorInfo;
}

export interface ICrudActionsContext {
  switchMode: (mode: CrudMode) => void;
}

export interface ICrudContext extends ICrudStateContext, ICrudActionsContext {
  performUpdate: () => Promise<void>;
  performCreate: () => Promise<void>;
  performDelete: () => Promise<void>;
  reset: () => Promise<void>;
  getInitialData: () => object;
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

export const CrudContext = createContext<ICrudContext>(undefined);