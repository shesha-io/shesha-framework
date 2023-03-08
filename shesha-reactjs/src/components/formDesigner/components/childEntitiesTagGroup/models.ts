import { IConfigurableFormComponent } from '../../../../providers';

export interface IChildEntitiesTagGroupProps extends IConfigurableFormComponent {
  formId?: string;
  labelFormat?: string;
  modalWidth?: '100%' | '80%' | '60%' | '40%';
}

export interface IChildEntitiesTagGroupSelectOptions {
  label?: string;
  value?: string;
  metadata?: any;
}

export interface IChildEntitiesTagGroupPayload<T = any> {
  value: T;
}
