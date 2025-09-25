import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IPropertyAutocompleteComponentProps extends IConfigurableFormComponent {
  dropdownStyle?: string;
  mode?: 'single' | 'multiple';
  modelType?: string;
  autoFillProps?: boolean;
}
