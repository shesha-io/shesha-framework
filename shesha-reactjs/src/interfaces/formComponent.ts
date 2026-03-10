export type DataTypeName = 'string' | 'number' | 'date' | 'entity' | 'boolean';

export type DataTypeDisplayAs = 'text' | 'drill-down' | 'quick-view' | 'stored-file';

export enum StandardNodeTypes {
  ConfigurableActionConfig = 'action-config',
};

export type StringValueChange = (key: string, value: string) => void;
export type NumberValueChange = (key: string, value: number) => void;
export type BooleanValueChange = (key: string, value: boolean) => void;

export interface IFormComponent {
  id?: string;
  name?: string;
  type?: string;
  form?: string;
  parent?: string; // form component
  orderIndex?: number;
  label?: string; // also use as a title
  value?: any; // This should not be of `any` type. We should accomodate string, number, tag, drill-down, quick-view and stored file
  required?: boolean;
  editable?: boolean;
  dataType: {
    name: DataTypeName;
    displayAs: DataTypeDisplayAs;
  };
  info?: string;
  isEditting?: boolean;
  onChange: StringValueChange | NumberValueChange | BooleanValueChange;
}
