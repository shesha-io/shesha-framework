import { ITableColumn } from '@/interfaces';
import {
  JsonLogicResult,
  FieldSettings,
  Widgets,
} from '@react-awesome-query-builder/antd';

export interface IHasHideForSelect {
  /**
   * If true, field will appear only at right side (when you compare field with another field)
   */
  hideForSelect: boolean;
}

export interface IHasHideForCompare {
  /**
   * If true, field will appear only at left side
   */
  hideForCompare: boolean;
}

export interface IQueryBuilderColumn extends ITableColumn {
  fieldSettings?: FieldSettings;
  preferWidgets?: Widgets[];
}

export interface IQueryBuilderProps {
  value?: JsonLogicResult;
  onChange?: (result: JsonLogicResult) => void;
  columns?: IQueryBuilderColumn[];
  showActionBtnOnHover?: boolean;
  readOnly?: boolean;
}
