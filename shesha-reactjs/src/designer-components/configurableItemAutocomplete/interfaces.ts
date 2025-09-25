import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IConfigurableItemAutocompleteComponentProps extends IConfigurableFormComponent {
  entityType: string;
  mode?: 'single' | 'multiple';
  filter?: object;
}
