import { IEntityTypeIdentifier } from "@/providers/sheshaApplication/publicApi/entities/models";
import { FC } from "react";

export interface IQueryBuilderProps {
  jsonExpanded?: boolean | undefined;
  modelType?: string | IEntityTypeIdentifier | undefined;
  fieldsUnavailableHint?: string | undefined;
  value?: object | undefined;
  onChange?: (value: Object) => void | undefined;
  readOnly?: boolean | undefined;
}

export interface IQueryBuilderFieldProps {
  jsonExpanded?: boolean | undefined;
  value?: object | undefined;
  onChange?: (value: any) => void | undefined;
  readOnly?: boolean | undefined;
}

export type QueryBuilderFieldType = FC<IQueryBuilderFieldProps>;
