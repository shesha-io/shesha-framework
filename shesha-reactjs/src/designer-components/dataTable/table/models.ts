import { IShaDataTableInlineEditableProps } from '@/components/dataTable/interfaces';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { IConfigurableFormComponent } from '@/providers/form/models';

export type RowDroppedMode = 'executeScript' | 'showDialog';

export interface ITableComponentBaseProps extends IShaDataTableInlineEditableProps {
  items: IConfigurableColumnsProps[];
  useMultiselect?: boolean;
  freezeHeaders?: boolean;
  containerStyle?: string;
  tableStyle?: string;
  minHeight?: number;
  maxHeight?: number;
  noDataText?: string;
  noDataSecondaryText?: string;
  noDataIcon?: string;
}

/** Table component props */
export interface ITableComponentProps extends ITableComponentBaseProps, IConfigurableFormComponent {}
