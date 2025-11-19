import { CSSProperties } from 'react';
import { IConfigurableFormComponent } from '@/providers';
import { ComponentDefinition } from '@/interfaces';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export interface IContextPropertyAutocompleteComponentProps extends IConfigurableFormComponent {
  dropdownStyle?: string;
  mode?: 'single' | 'multiple';
  modelType?: string | IEntityTypeIdentifier;
  autoFillProps?: boolean;
  styledLabel?: boolean;
}

interface IContextPropertyAutocompleteCalculatedModel {
  componentName: string;
  propertyName: string;
  contextName: string;
  style: CSSProperties;
  dropdownStyle: CSSProperties;
  modelType: string | IEntityTypeIdentifier;
  setFieldsValue: (values: any) => void;
}

export type ContextPropertyAutocompleteComponentDefinition = ComponentDefinition<"contextPropertyAutocomplete", IContextPropertyAutocompleteComponentProps, IContextPropertyAutocompleteCalculatedModel>;
