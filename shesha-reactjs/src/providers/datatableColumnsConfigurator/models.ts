import { IConfigurableActionConfiguration } from '../../interfaces/configurableAction';

type ColumnsItemType = 'item' | 'group';

export type ColumnsItemProps = IConfigurableColumnsProps | IConfigurableColumnGroup;

/**
 * Base properties of configurable column
 */
export interface IConfigurableColumnsBase {
  id: string;
  caption: string;
  sortOrder: number;
  itemType: ColumnsItemType;
  description?: string;
  minWidth?: number;
  maxWidth?: number;
  isVisible: boolean;
  isEditable?: boolean;
  permissions?: string[];
}

export type DatatableColumnType = 'data' | 'action' | 'calculated';

/**
 * Configurable table column
 */
export interface IConfigurableColumnsProps extends IConfigurableColumnsBase {
  columnType: DatatableColumnType;
}

/**
 * Configurable data column (displays property of the model)
 */
export interface IDataColumnsProps extends IConfigurableColumnsProps {
  propertyName: string;
}

/**
 * Configurable action column
 */
export interface IConfigurableActionColumnsProps extends IConfigurableColumnsProps {
  /**
   * Icon, is used for action columns
   */
  icon?: string;

  /**
   * Configurable action configuration
   */
  actionConfiguration?: IConfigurableActionConfiguration;
  //#endregion
}

/**
 * Configurable columns group
 */
export interface IConfigurableColumnGroup extends IConfigurableColumnsBase {
  childItems?: ColumnsItemProps[];
}
