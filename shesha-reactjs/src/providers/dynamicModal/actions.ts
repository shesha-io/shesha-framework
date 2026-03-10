import { createAction } from 'redux-actions';
import { IModalProps } from './models';

export enum DynamicModalActionEnums {
  Open = 'OPEN',
  CreateModal = 'CREATE_MODAL',
  RemoveModal = 'REMOVE_MODAL',
}

export interface ICreateModalPayload {
  modalProps: IModalProps;
}

export const openAction = createAction<IModalProps, IModalProps>(DynamicModalActionEnums.Open, (p) => p);

export const createModalAction = createAction<ICreateModalPayload, ICreateModalPayload>(
  DynamicModalActionEnums.CreateModal,
  (p) => p,
);

export const removeModalAction = createAction<string, string>(DynamicModalActionEnums.RemoveModal, (p) => p);

/* NEW_ACTION_GOES_HERE */
