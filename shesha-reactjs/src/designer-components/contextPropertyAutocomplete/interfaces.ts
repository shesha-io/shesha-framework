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
  componentId: string;
  componentType: string;
  componentName: string;
  propertyName: string;
  contextName: string;
  style: CSSProperties;
  dropdownStyle: CSSProperties;
  modelType: string | IEntityTypeIdentifier;
  getFieldsValue: () => any;
  setFieldsValue: (values: any) => void;
  clearFieldsValue: () => void;
  getPropertyName: () => string;
}

export type ContextPropertyAutocompleteComponentDefinition = ComponentDefinition<"contextPropertyAutocomplete", IContextPropertyAutocompleteComponentProps, IContextPropertyAutocompleteCalculatedModel>;
