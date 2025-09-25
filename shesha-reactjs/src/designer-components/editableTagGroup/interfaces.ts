import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IEditableTagGroupComponentProps extends IConfigurableFormComponent {
  value?: string[];
  defaultValue?: string;
  onChange?: (values?: string[]) => void;
}
