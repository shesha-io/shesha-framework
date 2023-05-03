import { IErrorInfo } from 'interfaces/errorInfo';
import { createContext } from 'react';
import { CrudMode } from './models';

export interface ICrudStateContext {
  isNewObject: boolean;
  allowEdit: boolean;
  allowDelete: boolean;
  mode: CrudMode;
  lastError?: IErrorInfo;
}

export interface ICrudActionsContext {
  switchMode: (mode: CrudMode) => void;
  setLastError: (error?: IErrorInfo) => void;
}

export interface ICrudContext extends ICrudStateContext, ICrudActionsContext {
  performUpdate: () => Promise<void>;
  performCreate: () => Promise<void>;
  performDelete: () => Promise<void>;
  reset: () => Promise<void>;
}

/** initial state */
export const CRUD_CONTEXT_INITIAL_STATE: ICrudStateContext = {
  isNewObject: false,
  allowEdit: true,
  allowDelete: true,
  mode: 'read',
};

export const CrudContext = createContext<ICrudContext>(undefined);