import { IConfigurableFormComponent } from '../../../../providers';

export interface IJsonEntityProps extends IConfigurableFormComponent {
  formId?: string;
  labelFormat?: string;
  modalWidth?: '100%' | '80%' | '60%' | '40%';
}

export interface IJsonEntitySelectOptions {
  label?: string;
  value?: string;
  metadata?: any;
}

export interface IJsonEntityPayload<T = any> {
  value: T;
}
