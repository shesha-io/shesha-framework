import { IConfigurableFormComponent } from '../../../../providers';

export interface IChildEntitiesTagGroupProps extends IConfigurableFormComponent {
  capturedProperties?: string[];
  formId?: string;
  labelFormat?: string;
  labelProperties?: string[];
  modalTitle?: string;
  modalWidth?: '100%' | '80%' | '60%' | '40%';
  deleteConfirmationTitle?: string;
  deleteConfirmationBody?: string;
}

export interface IChildEntitiesTagGroupSelectOptions {
  label?: string;
  value?: string;
  metadata?: any;
}
