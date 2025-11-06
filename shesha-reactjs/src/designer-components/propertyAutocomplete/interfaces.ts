import { IConfigurableFormComponent } from '@/providers/form/models';
import { IEntityTypeIndentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export interface IPropertyAutocompleteComponentProps extends IConfigurableFormComponent {
  dropdownStyle?: string;
  mode?: 'single' | 'multiple';
  modelType?: string | IEntityTypeIndentifier;
  autoFillProps?: boolean;
}
