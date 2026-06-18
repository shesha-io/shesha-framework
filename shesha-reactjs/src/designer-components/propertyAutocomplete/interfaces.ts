import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { CSSProperties } from 'react';

export interface IPropertyAutocompleteComponentProps extends IConfigurableFormComponent {
  dropdownStyle?: string;
  mode?: 'single' | 'multiple';
  modelType?: string | IEntityTypeIdentifier;
  autoFillProps?: boolean;
  propertyModelType?: string | IEntityTypeIdentifier;
}

export type PropertyAutocompleteCalculatedProps = {
  modelType: string | IEntityTypeIdentifier | undefined;
  dropdownStyle: CSSProperties | undefined;
};

export type PropertyAutocompleteComponentDefinition = ComponentDefinition<"propertyAutocomplete", IPropertyAutocompleteComponentProps, PropertyAutocompleteCalculatedProps>;
