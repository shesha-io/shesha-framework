import { ReactNode, createContext } from 'react';
import { IFormDesignerActionFlag } from './models';

export interface IFormInfoContentStateStateContext {
  actionFlag?: { [key in IFormDesignerActionFlag]?: boolean };
  renderToolbarRightButtons?: ReactNode[];
}

export interface IFormInfoContentStateActionsContext {
  /** Flag set to determine action triggered from external source */
  setActionFlag: (flag: IFormDesignerActionFlag) => void;

  /** Set form designer toolbar button */
  setToolbarRightButton: (button: ReactNode) => void;
}

export const FORM_INFO_CONTENT_STATE_CONTEXT_INITIAL_STATE: IFormInfoContentStateStateContext = {
  actionFlag: {},
  renderToolbarRightButtons: null,
};

export const FormInfoContentStateStateContext = createContext<IFormInfoContentStateStateContext>(
  FORM_INFO_CONTENT_STATE_CONTEXT_INITIAL_STATE
);

export const FormInfoContentStateActionsContext = createContext<IFormInfoContentStateActionsContext>(undefined);
