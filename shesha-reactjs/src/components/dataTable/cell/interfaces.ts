import { CellProps } from 'react-table';
import { ITableColumn } from '../../../interfaces';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { ITableDataColumn } from '@/providers/dataTable/interfaces';
import { IFieldComponentProps } from '@/providers/datatableColumnsConfigurator/models';

export interface IHasColumnConfig<TConfig extends ITableColumn> {
  columnConfig?: TConfig;
}
export interface IHasPropertyMetadata {
  propertyMeta?: IPropertyMetadata;
}
export interface IConfigurableCellProps<TConfig extends ITableColumn>
  extends IHasPropertyMetadata,
    IHasColumnConfig<TConfig> {}

export interface ICommonCellProps<TConfig extends ITableColumn, D extends object = {}, V = any>
  extends CellProps<D, V>,
    IConfigurableCellProps<TConfig> {}

export interface IDataCellProps<D extends object = {}, V = any> extends ICommonCellProps<ITableDataColumn, D, V> {}

export interface IComponentWrapperProps {
  customComponent: IFieldComponentProps;
  columnConfig: ITableDataColumn;
  propertyMeta?: IPropertyMetadata;
  defaultRow?: { [key in string]?: any };
  defaultValue?: any;
  readOnly?: boolean;
}
