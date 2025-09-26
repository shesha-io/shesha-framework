import { FC } from "react";

export interface IQueryBuilderProps {
  jsonExpanded?: boolean;
  modelType?: string;
  fieldsUnavailableHint?: string;
  value?: object;
  onChange?: (value: Object) => void;
  readOnly?: boolean;
}

export interface IQueryBuilderFieldProps {
  jsonExpanded?: boolean;
  value?: object;
  onChange?: (value: any) => void;
  readOnly?: boolean;
}

export type QueryBuilderFieldType = FC<IQueryBuilderFieldProps>;
