import { ITableColumn } from '@/interfaces';
import {
  JsonLogicResult,
  JsonLogicTree,
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
  /**
   * The JsonLogic expression tree to display.
   *
   * Note the deliberate asymmetry with `onChange`: this is the bare tree (the same shape as
   * `JsonLogicResult.logic`), whereas `onChange` emits the full result including `data` and `errors`.
   * Consumers are expected to unwrap `.logic` before feeding a value back in.
   */
  value?: JsonLogicTree | undefined;
  onChange?: (result: JsonLogicResult) => void;
  columns?: IQueryBuilderColumn[];
  showActionBtnOnHover?: boolean;
  readOnly?: boolean;
}
