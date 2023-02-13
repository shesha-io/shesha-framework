import { createContext } from 'react';
import { ICommonModalProps, IModalInstance } from './models';

export interface IDynamicModalStateContext {
  //instances: IModalInstance[];
  instances: { [index: string]: IModalInstance };
}

export interface IDynamicModalActionsContext {
  toggle: (id: string, visible: boolean) => void;
  show: (id: string) => void;
  hide: (id: string) => void;
  open: (modalProps: ICommonModalProps) => void;

  modalExists: (id: string) => boolean;
  createModal: (modalProps: ICommonModalProps) => void;
  removeModal: (id: string) => void;

  /* NEW_ACTION_ACTION_DECLARATIO_GOES_HERE */
}

export interface IToggleModalPayload {
  id: string;
  isVisible: boolean;
}

export const DYNAMIC_MODAL_CONTEXT_INITIAL_STATE: IDynamicModalStateContext = {
  instances: {},
};

export const DynamicModalStateContext = createContext<IDynamicModalStateContext>(DYNAMIC_MODAL_CONTEXT_INITIAL_STATE);

export const DynamicModalActionsContext = createContext<IDynamicModalActionsContext>(undefined);

//#region modal instance

export interface IDynamicModalInstanceContext {
  instance?: IModalInstance;
  show: () => void;
  hide: () => void;
  close: () => void;
}

export const DYNAMIC_MODAL_INSTANCE_CONTEXT_INITIAL_STATE: IDynamicModalInstanceContext = {
  instance: null,
  show: () => { /*nop*/ },
  hide: () => { /*nop*/ },
  close: () => { /*nop*/ },
};

export const DynamicModalInstanceContext = createContext<IDynamicModalInstanceContext>(
  DYNAMIC_MODAL_INSTANCE_CONTEXT_INITIAL_STATE
);

//#endregion
