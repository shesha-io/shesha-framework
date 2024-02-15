import { IConfigurableFormComponent } from '@/interfaces';
import { DatatableColumnType, IActionColumnProps, IAnchoredDirection } from '@/providers/dataTable/interfaces';

type ColumnsItemType = 'item' | 'group';

export interface IColumnEditorProps extends IConfigurableFormComponent {}

export interface IFieldComponentProps {
  type: string;
  settings?: IColumnEditorProps;
}

export interface IEditableColumnProps {
  displayComponent?: IFieldComponentProps;
  editComponent?: IFieldComponentProps;
  createComponent?: IFieldComponentProps;
}

/**
 * Base properties of configurable column
 */
export interface IConfigurableColumnsBase {
  id: string;
  caption: string;
  columnType?: DatatableColumnType;
  sortOrder: number;
  itemType: ColumnsItemType;
  description?: string;
  minWidth?: number;
  maxWidth?: number;
  isVisible: boolean;
  permissions?: string[];
  backgroundColor?: string;// IPropertySetting<string>;
}

/**
 * Configurable table column
 */
export interface IConfigurableColumnsProps extends IConfigurableColumnsBase {
  columnType: DatatableColumnType;
  anchored?: IAnchoredDirection;
  customVisibility?: string;
  customEnabled?: string;
}

/**
 * Configurable data column (displays property of the model)
 */
export interface IDataColumnsProps extends IConfigurableColumnsProps, IEditableColumnProps {
  propertyName: string;
  allowSorting: boolean;
}

/**
 * Configurable action column
 */
export interface IConfigurableActionColumnsProps extends IConfigurableColumnsProps, IActionColumnProps {}

/**
 * Configurable columns group
 */
export interface IConfigurableColumnGroup extends IConfigurableColumnsBase {
  childItems?: ColumnsItemProps[];
}

export type ColumnsItemProps = IConfigurableColumnsProps | IConfigurableColumnGroup;

export const standardCellComponentTypes = {
  defaultDisplay: '[default]',
  notEditable: '[not-editable]',
};

export const isDataColumnProps = (column: IConfigurableColumnsProps): column is IDataColumnsProps => {
  return column && column.columnType === 'data';
};

export const isActionColumnProps = (column: IConfigurableColumnsProps): column is IConfigurableActionColumnsProps => {
  return column && column.columnType === 'action';
};