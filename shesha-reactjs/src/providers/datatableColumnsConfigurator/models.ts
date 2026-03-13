import { FormFullName, IConfigurableFormComponent } from '@/interfaces';
import { DatatableColumnType, IActionColumnProps, IAnchoredDirection } from '@/providers/dataTable/interfaces';
import { isDefined } from '@/utils/nullables';
import { ReactNode } from 'react';

type ColumnsItemType = 'item' | 'group';

export type IColumnEditorProps = IConfigurableFormComponent;

export interface IFieldComponentProps {
  type: string;
  settings?: IColumnEditorProps;
}

export interface IEditableColumnProps {
  displayComponent?: IFieldComponentProps | undefined;
  editComponent?: IFieldComponentProps | undefined;
  createComponent?: IFieldComponentProps | undefined;
}

/**
 * Base properties of configurable column
 */
export interface IConfigurableColumnsBase {
  id: string;
  caption: string;
  columnType?: DatatableColumnType | undefined;
  sortOrder: number;
  itemType: ColumnsItemType;
  description?: string | undefined;
  minWidth?: number | undefined;
  maxWidth?: number | undefined;
  isVisible: boolean;
  permissions?: string[] | undefined;
  backgroundColor?: string | undefined;
}

/**
 * Configurable table column
 */
export interface IConfigurableColumnsProps extends IConfigurableColumnsBase {
  hidden?: boolean;
  accessor?: string;
  columnType: DatatableColumnType;
  anchored?: IAnchoredDirection;
  customVisibility?: string;
  customEnabled?: string;
}

export interface IRendererColumnProps extends IConfigurableColumnsProps {
  renderCell: (row: object) => ReactNode | string;
}

/**
 * Configurable data column (displays property of the model)
 */
export interface IDataColumnsProps extends IConfigurableColumnsProps, IEditableColumnProps {
  propertyName: string;
  allowSorting: boolean;
}

export const isDataColumn = (column: IConfigurableColumnsProps): column is IDataColumnsProps => {
  return Boolean(column) && column.columnType === 'data';
};

export type ICrudOperationsColumnProps = IConfigurableColumnsProps;

/**
 * Configurable form column (displays form)
 */
export interface IFormColumnsProps extends IConfigurableColumnsProps, IEditableColumnProps {
  propertiesNames?: string;

  displayFormId?: FormFullName;
  createFormId?: FormFullName;
  editFormId?: FormFullName;

  minHeight?: number;
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

export const isDataColumnProps = (column: IConfigurableColumnsProps | undefined): column is IDataColumnsProps => {
  return isDefined(column) && column.columnType === 'data';
};

export const isActionColumnProps = (column: IConfigurableColumnsProps | undefined): column is IConfigurableActionColumnsProps => {
  return isDefined(column) && column.columnType === 'action';
};

export const isCrudOperationsColumnProps = (column: IConfigurableColumnsProps | undefined): column is ICrudOperationsColumnProps => {
  return isDefined(column) && column.columnType === 'crud-operations';
};

export const isRendererColumnProps = (column: IConfigurableColumnsProps | undefined): column is IRendererColumnProps => {
  return isDefined(column) && column.columnType === 'renderer';
};

export const isFormColumnProps = (column: IConfigurableColumnsProps | undefined): column is IFormColumnsProps => {
  return isDefined(column) && column.columnType === 'form';
};
