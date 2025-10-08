import { ICommonModalProps, IModalInstance } from './models';
import { createNamedContext } from '@/utils/react';

//#region modal provider

export interface IDynamicModalStateContext {
  instances: { [index: string]: IModalInstance };
}

export interface IDynamicModalActionsContext {
  open: (modalProps: ICommonModalProps) => void;
  modalExists: (id: string) => boolean;
  createModal: (modalProps: ICommonModalProps) => void;
  removeModal: (id: string) => void;
}

export const DYNAMIC_MODAL_CONTEXT_INITIAL_STATE: IDynamicModalStateContext = {
  instances: {},
};

export const DynamicModalStateContext = createNamedContext<IDynamicModalStateContext>(DYNAMIC_MODAL_CONTEXT_INITIAL_STATE, "DynamicModalStateContext");

export const DynamicModalActionsContext = createNamedContext<IDynamicModalActionsContext>(undefined, "DynamicModalActionsContext");

//#endregion

//#region modal instance

export interface IDynamicModalInstanceContext {
  instance?: IModalInstance;
  close: () => void;
}

export const DYNAMIC_MODAL_INSTANCE_CONTEXT_INITIAL_STATE: IDynamicModalInstanceContext = {
  instance: null,
  close: () => {
    /* nop*/
  },
};

export const DynamicModalInstanceContext = createNamedContext<IDynamicModalInstanceContext>(
  DYNAMIC_MODAL_INSTANCE_CONTEXT_INITIAL_STATE,
  "DynamicModalInstanceContext",
);

//#endregion

//#region modal renderer

export interface IDynamicModalRendererContext {
  registerChildren: (id: string) => void;
  unregisterChildren: (id: string) => void;
};

export const DYNAMIC_MODAL_RENDERER_CONTEXT_INITIAL_STATE: IDynamicModalRendererContext = {
  registerChildren: () => {
    /* nop*/
  },
  unregisterChildren: () => {
    /* nop*/
  },
};

export const DynamicModalRendererContext = createNamedContext<IDynamicModalRendererContext>(
  DYNAMIC_MODAL_RENDERER_CONTEXT_INITIAL_STATE,
  "DynamicModalRendererContext",
);

//#endregion
