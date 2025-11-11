import { IConfigurableFormComponent } from '@/providers/form/models';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export interface IPropertyAutocompleteComponentProps extends IConfigurableFormComponent {
  dropdownStyle?: string;
  mode?: 'single' | 'multiple';
  modelType?: string | IEntityTypeIdentifier;
  autoFillProps?: boolean;
}
