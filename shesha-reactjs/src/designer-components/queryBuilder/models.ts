import { JsonLogicFilter } from "@/interfaces/jsonLogic";
import { IEntityTypeIdentifier } from "@/providers/sheshaApplication/publicApi/entities/models";
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
  value?: JsonLogicFilter | undefined;
  onChange?: (value: JsonLogicFilter | null) => void | undefined;
  showJsonTestingTools?: boolean | undefined;
  readOnly?: boolean | undefined;
}

export type QueryBuilderFieldType = FC<IQueryBuilderFieldProps>;
