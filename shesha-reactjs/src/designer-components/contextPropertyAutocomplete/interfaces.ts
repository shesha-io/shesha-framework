import { CSSProperties } from 'react';
import { IConfigurableFormComponent } from '@/providers';
import { ComponentDefinition } from '@/interfaces';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export interface IContextPropertyAutocompleteComponentProps extends IConfigurableFormComponent {
  dropdownStyle?: string | undefined;
  modelType?: string | IEntityTypeIdentifier | undefined;
  autoFillProps?: boolean | undefined;
  styledLabel?: boolean | undefined;
}

export interface IContextPropertyAutocompleteCalculatedModel {
  componentId: string;
  componentType: string;
  componentName: string | undefined;
  propertyName: string | undefined;
  contextName: string | undefined;
  style: CSSProperties;
  dropdownStyle: CSSProperties;
  modelType: string | IEntityTypeIdentifier | undefined;
  getFieldsValue: (() => object) | undefined;
  setFieldsValue: ((values: object) => void) | undefined;
  clearFieldsValue: (() => void) | undefined;
  getPropertyName: (() => string) | undefined;
}

export type ContextPropertyAutocompleteComponentDefinition = ComponentDefinition<"contextPropertyAutocomplete", IContextPropertyAutocompleteComponentProps, IContextPropertyAutocompleteCalculatedModel>;
