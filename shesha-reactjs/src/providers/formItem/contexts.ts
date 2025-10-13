import { createNamedContext } from '@/utils/react';
import { ColProps } from 'antd';

export interface IFormItemStateContext {
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  namePrefix?: string;
}

export const FORM_ITEM_CONTEXT_INITIAL_STATE: IFormItemStateContext = {};

export const FormItemStateContext = createNamedContext<IFormItemStateContext>(FORM_ITEM_CONTEXT_INITIAL_STATE, "FormItemStateContext");
