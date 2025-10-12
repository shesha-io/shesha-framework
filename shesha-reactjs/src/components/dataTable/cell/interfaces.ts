import { CellProps } from 'react-table';
import { FormMode, ITableColumn } from '@/interfaces';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { ITableDataColumn, ITableFormColumn } from '@/providers/dataTable/interfaces';
import { IFieldComponentProps } from '@/providers/datatableColumnsConfigurator/models';
import { InlineEditMode } from '@/components/reactTable/interfaces';

export interface IHasColumnConfig<TConfig extends ITableColumn> {
  columnConfig?: TConfig;
}
export interface IHasPropertyMetadata {
  propertyMeta?: IPropertyMetadata;
}
export interface IConfigurableCellProps<TConfig extends ITableColumn>
  extends IHasPropertyMetadata,
  IHasColumnConfig<TConfig> { }

export interface ICommonCellProps<TConfig extends ITableColumn, D extends object = object, V = any>
  extends CellProps<D, V>,
  IConfigurableCellProps<TConfig> { }

export type IDataCellProps<D extends object = object, V = any> = ICommonCellProps<ITableDataColumn, D, V>;

export type IRendererCellProps<D extends object = object, V = any> = ICommonCellProps<ITableDataColumn, D, V>;

export interface IFormCellProps<D extends object = object, V = any> extends ICommonCellProps<ITableFormColumn, D, V> {
  /** FormId GUID */
  parentFormId?: string;
  /** `Module`/`FormName` */
  parentFormName?: string;
}

export interface IComponentWrapperProps {
  customComponent: IFieldComponentProps;
  columnConfig: ITableDataColumn;
  propertyMeta?: IPropertyMetadata;
  defaultRow?: { [key in string]?: any };
  defaultValue?: any;
  readOnly?: boolean;
}

export interface ITableCrudOptions {
  canDelete?: boolean;
  canEdit?: boolean;
  inlineEditMode?: InlineEditMode;
  canAdd?: boolean;
  formMode: FormMode;
}
export interface IChangeProps {
  add?: boolean;
  edit?: boolean;
  delete?: boolean;
  inlineEditMode?: boolean;
}

export interface ICrudOptions {
  canDivideWidth?: boolean;
  canDoubleWidth?: boolean;
  canTripleWidth?: boolean;
  canDivideByThreeWidth?: boolean;
  columnsChanged?: boolean;
}
