import { FormInstance } from 'antd';
import { IModelMetadata } from '@/interfaces';
import {
  FormMode,
  IConfigurableFormComponent,
  IFormSettings,
} from './models';
import { createNamedContext } from '@/utils/react';
import { IShaFormInstance } from './store/interfaces';

export interface IFormStateContext<TData extends object = object> {
  name?: string | undefined;
  formSettings: IFormSettings | undefined;
  formMode: FormMode;
  form?: FormInstance<TData> | undefined;

  // runtime props
  formData?: TData | undefined;

  // TODO: review and remove
  modelMetadata?: IModelMetadata | undefined;
  shaForm: IShaFormInstance<TData>;
}

export interface ISetFormDataPayload<TValue extends object = object> {
  /** form field values */
  values: TValue;

  /** if true, previous data will be merged with current values */
  mergeValues: boolean;
}

export interface IFormActionsContext<TData extends object = object> {
  setFormMode: (formMode: FormMode) => void;
  setFormData: (payload: ISetFormDataPayload<TData>) => void;

  isComponentFiltered: (component: IConfigurableFormComponent) => boolean;
}

export interface ConfigurableFormInstance<TValue extends object = object> extends IFormActionsContext<TValue>, IFormStateContext<TValue> { }

export const FormStateContext = createNamedContext<IFormStateContext | undefined>(undefined, "FormStateContext");

export const FormActionsContext = createNamedContext<IFormActionsContext | undefined>(undefined, "FormActionsContext");
