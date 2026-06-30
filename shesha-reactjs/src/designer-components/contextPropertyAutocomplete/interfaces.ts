import { CSSProperties } from 'react';
import { IConfigurableFormComponent, UnwrapCodeEvaluators } from '@/providers';
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
  componentName?: string | undefined;
  propertyName?: string | undefined;
  contextName?: string | undefined;
  style: CSSProperties;
  dropdownStyle: CSSProperties;
  modelType: string | IEntityTypeIdentifier | undefined;
  getFieldsValue: (() => IContextPropertyAutocompleteValue) | undefined;
  setFieldsValue: ((values: IContextPropertyAutocompleteValue) => void) | undefined;
  clearFieldsValue: (() => void) | undefined;
  getPropertyName: (() => string | undefined) | undefined;
}

export interface IContextPropertyAutocompleteValue {
  propertyName?: string | undefined;
  componentName?: string | undefined;
  context?: string | undefined;
  id?: string | undefined;
  type?: string | undefined;
}

export interface IContextPropertyAutocompleteProps extends Omit<UnwrapCodeEvaluators<IContextPropertyAutocompleteComponentProps>, 'style' | 'dropdownStyle' | 'type'> {
  componentName?: string | undefined;
  propertyName?: string | undefined;
  contextName?: string | undefined;
  style?: CSSProperties | undefined;
  dropdownStyle?: CSSProperties | undefined;
  defaultModelType?: string | IEntityTypeIdentifier | undefined;
  onValuesChange?: (changedValues: object) => void | undefined;
}

export interface IContextPropertyAutocompleteState {
  mode: 'formData' | 'context';
  context?: string | undefined;
  propertyName?: string | undefined;
  componentName?: string | undefined;
}

export type ContextPropertyAutocompleteComponentDefinition = ComponentDefinition<"contextPropertyAutocomplete", IContextPropertyAutocompleteComponentProps, IContextPropertyAutocompleteCalculatedModel>;
