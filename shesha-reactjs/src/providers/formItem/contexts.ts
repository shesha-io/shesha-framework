import { ColProps } from 'antd';
import { createContext } from 'react';

export interface IFormItemStateContext {
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  namePrefix?: string;
}

export interface IFormItemActionsContext {}

export const FORM_ITEM_CONTEXT_INITIAL_STATE: IFormItemStateContext = {};

export const FormItemStateContext = createContext<IFormItemStateContext>(FORM_ITEM_CONTEXT_INITIAL_STATE);

export const FormItemActionsContext = createContext<IFormItemActionsContext>(undefined);
