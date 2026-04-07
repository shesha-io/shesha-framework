import { FormInstance } from 'antd';
import { IModelMetadata, IToolboxComponentGroup } from '@/interfaces';
import {
  FormMode,
  IConfigurableFormComponent,
  IFormSettings,
} from './models';
import { createNamedContext } from '@/utils/react';
import { IShaFormInstance } from './store/interfaces';

export interface IHasComponentGroups {
  toolboxComponentGroups: IToolboxComponentGroup[];
}

export interface IFormStateContext<TData extends object = object> {
  name?: string;
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

export interface FieldData {
  name: string | number | (string | number)[];
  value?: unknown;
  touched?: boolean;
  validating?: boolean;
  errors?: string[];
}

export interface IFormDataStateContext {
  fields: FieldData[];
}

export interface IFormDataActionsContext {
  setFields: (fields: FieldData[]) => void;
}

export const FormDataStateContext = createNamedContext<IFormDataStateContext | undefined>(undefined, "FormDataStateContext");
export const FormDataActionsContext = createNamedContext<IFormDataActionsContext | undefined>(undefined, "FormDataActionsContext");

export interface ConfigurableFormInstance<TValue extends object = object> extends IFormActionsContext, IFormStateContext<TValue> { }

export const FormStateContext = createNamedContext<IFormStateContext | undefined>(undefined, "FormStateContext");

export const FormActionsContext = createNamedContext<IFormActionsContext | undefined>(undefined, "FormActionsContext");
