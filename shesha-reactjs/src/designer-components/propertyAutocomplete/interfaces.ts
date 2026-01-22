import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export interface IPropertyAutocompleteComponentProps extends IConfigurableFormComponent {
  dropdownStyle?: string;
  mode?: 'single' | 'multiple';
  modelType?: string | IEntityTypeIdentifier;
  autoFillProps?: boolean;
  propertyModelType?: string | IEntityTypeIdentifier;
}

export type PropertyAutocompleteComponentDefinition = ComponentDefinition<"propertyAutocomplete", IPropertyAutocompleteComponentProps>;
