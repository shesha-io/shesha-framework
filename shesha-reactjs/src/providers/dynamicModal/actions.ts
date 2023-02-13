import { createAction } from 'redux-actions';
import { IToggleModalPayload } from './contexts';
import { IModalProps } from './models';

export enum DynamicModalActionEnums {
  Toggle = 'TOGGLE',
  Open = 'OPEN',
  CreateModal = 'CREATE_MODAL',
  RemoveModal = 'REMOVE_MODAL',

  /* NEW_ACTION_TYPE_GOES_HERE */
}

export interface ICreateModalPayload {
  modalProps: IModalProps;
}

export const toggleAction = createAction<IToggleModalPayload, IToggleModalPayload>(
  DynamicModalActionEnums.Toggle,
  p => p
);

export const openAction = createAction<IModalProps, IModalProps>(DynamicModalActionEnums.Open, p => p);

export const createModalAction = createAction<ICreateModalPayload, ICreateModalPayload>(
  DynamicModalActionEnums.CreateModal,
  p => p
);

export const removeModalAction = createAction<string, string>(DynamicModalActionEnums.RemoveModal, p => p);

/* NEW_ACTION_GOES_HERE */
