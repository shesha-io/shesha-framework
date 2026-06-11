import { createAction } from '@reduxjs/toolkit';
import { ICommonModalProps } from './models';

export enum DynamicModalActionEnums {
  Open = 'OPEN',
  CreateModal = 'CREATE_MODAL',
  RemoveModal = 'REMOVE_MODAL',
}

export interface ICreateModalPayload {
  modalProps: ICommonModalProps;
}

export const openAction = createAction<ICommonModalProps>(DynamicModalActionEnums.Open);

export const createModalAction = createAction<ICreateModalPayload>(DynamicModalActionEnums.CreateModal);

export const removeModalAction = createAction<string>(DynamicModalActionEnums.RemoveModal);

