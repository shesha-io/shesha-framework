import { IShaDataTableInlineEditableProps } from '@/components/dataTable/interfaces';
import { IConfigurableActionConfiguration } from '@/providers';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { IConfigurableFormComponent } from '@/providers/form/models';

export type RowDroppedMode = 'executeScript' | 'showDialog';

export interface ITableComponentBaseProps extends IShaDataTableInlineEditableProps {
  items: IConfigurableColumnsProps[];
  useMultiselect?: boolean;
  selectionMode?: 'none' | 'single' | 'multiple';
  freezeHeaders?: boolean;
  containerStyle?: string;
  tableStyle?: string;
  minHeight?: number;
  maxHeight?: number;
  noDataText?: string;
  noDataSecondaryText?: string;
  noDataIcon?: string;
  dblClickActionConfiguration?: IConfigurableActionConfiguration;
  rowClickActionConfiguration?: IConfigurableActionConfiguration;
  rowDoubleClickActionConfiguration?: IConfigurableActionConfiguration;
  rowHoverActionConfiguration?: IConfigurableActionConfiguration;
  rowSelectActionConfiguration?: IConfigurableActionConfiguration;
  selectionChangeActionConfiguration?: IConfigurableActionConfiguration;
}

/** Table component props */
export interface ITableComponentProps extends ITableComponentBaseProps, IConfigurableFormComponent {}
