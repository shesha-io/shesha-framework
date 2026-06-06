import { IEntityTypeIdentifier } from "@/providers/sheshaApplication/publicApi/entities/models";

export interface IQueryBuilderProps {
  jsonExpanded?: boolean | undefined;
  showJsonTestingTools?: boolean | undefined;
  modelType?: string | IEntityTypeIdentifier | undefined;
  fieldsUnavailableHint?: string | undefined;
  value?: object | undefined;
  onChange?: (value: Object) => void | undefined;
  readOnly?: boolean | undefined;
}

export interface IQueryBuilderFieldProps {
  jsonExpanded?: boolean | undefined;
  showJsonTestingTools?: boolean | undefined;
  value?: object | undefined;
  onChange?: (value: any) => void | undefined;
  readOnly?: boolean | undefined;
}
