import { JsonLogicFilter } from "@/interfaces/jsonLogic";
import { IEntityTypeIdentifier } from "@/providers/sheshaApplication/publicApi/entities/models";
import { JsonLogicTree } from "@react-awesome-query-builder/antd";
import { FC } from "react";

export interface IQueryBuilderProps {
  jsonExpanded?: boolean | undefined;
  modelType?: string | IEntityTypeIdentifier | undefined;
  fieldsUnavailableHint?: string | undefined;
  value?: JsonLogicFilter | undefined;
  onChange?: ((value: JsonLogicFilter | null) => void) | undefined;
  readOnly?: boolean | undefined;
}

export interface IQueryBuilderFieldProps {
  jsonExpanded?: boolean | undefined;
  value?: object | undefined;
  onChange?: (value: JsonLogicTree | null) => void | undefined;
  readOnly?: boolean | undefined;
}

export type QueryBuilderFieldType = FC<IQueryBuilderFieldProps>;
