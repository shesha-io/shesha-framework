import { IEntityTypeIdentifier } from "@/providers/sheshaApplication/publicApi/entities/models";
import { FC } from "react";

export interface IQueryBuilderProps {
  jsonExpanded?: boolean;
  showJsonTestingTools?: boolean;
  modelType?: string | IEntityTypeIdentifier;
  fieldsUnavailableHint?: string;
  value?: object;
  onChange?: (value: Object) => void;
  readOnly?: boolean;
}

export interface IQueryBuilderFieldProps {
  jsonExpanded?: boolean;
  showJsonTestingTools?: boolean;
  value?: object;
  onChange?: (value: any) => void;
  readOnly?: boolean;
}

export type QueryBuilderFieldType = FC<IQueryBuilderFieldProps>;
