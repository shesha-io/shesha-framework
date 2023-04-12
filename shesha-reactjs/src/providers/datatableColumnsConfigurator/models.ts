import { IConfigurableFormComponent } from 'interfaces';
import { DatatableColumnType, IActionColumnProps } from 'providers/dataTable/interfaces';

type ColumnsItemType = 'item' | 'group';

export type ColumnsItemProps = IConfigurableColumnsProps | IConfigurableColumnGroup;

export interface IColumnEditorProps extends IConfigurableFormComponent {

}

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
export interface  IConfigurableColumnsBase {
  id: string;
  caption: string;
  sortOrder: number;
  itemType: ColumnsItemType;
  description?: string;
  minWidth?: number;
  maxWidth?: number;
  isVisible: boolean;
  permissions?: string[];
}

/**
 * Configurable table column
 */
export interface IConfigurableColumnsProps extends IConfigurableColumnsBase {
  columnType: DatatableColumnType;
}

/**
 * Configurable data column (displays property of the model)
 */
export interface IDataColumnsProps extends IConfigurableColumnsProps, IEditableColumnProps {
  propertyName: string;
}

/**
 * Configurable action column
 */
export interface IConfigurableActionColumnsProps extends IConfigurableColumnsProps, IActionColumnProps {
}

/**
 * Configurable columns group
 */
export interface IConfigurableColumnGroup extends IConfigurableColumnsBase {
  childItems?: ColumnsItemProps[];
}

export const standardCellComponentTypes = {
  defaultDisplay: '[default]',
  notEditable: '[not-editable]',
};