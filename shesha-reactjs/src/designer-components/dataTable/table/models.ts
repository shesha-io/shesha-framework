import { IShaDataTableInlineEditableProps } from '@/components/dataTable/interfaces';
import { IConfigurableActionConfiguration } from '@/providers';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { ICommonContainerProps } from '../../container/interfaces';
import { IBorderValue } from '@/designer-components/_settings/utils/border/interfaces';

export type RowDroppedMode = 'executeScript' | 'showDialog';

export interface ITableComponentBaseProps extends IShaDataTableInlineEditableProps, Omit<ICommonContainerProps, 'style'> {
  items: IConfigurableColumnsProps[];
  useMultiselect?: boolean;
  freezeHeaders?: boolean;
  showExpandedView?: boolean;
  containerStyle?: string;
  tableStyle?: string;
  minHeight?: number;
  maxHeight?: number;
  noDataText?: string;
  noDataSecondaryText?: string;
  noDataIcon?: string;
  dblClickActionConfiguration?: IConfigurableActionConfiguration;

  onRowClick?: IConfigurableActionConfiguration;
  onRowDoubleClick?: IConfigurableActionConfiguration;
  onRowHover?: IConfigurableActionConfiguration;
  onRowSelect?: IConfigurableActionConfiguration;
  onSelectionChange?: IConfigurableActionConfiguration;

  striped?: boolean;
  hoverHighlight?: boolean;
  stickyHeader?: boolean;

  rowBackgroundColor?: string;
  rowAlternateBackgroundColor?: string;
  rowHoverBackgroundColor?: string;
  rowSelectedBackgroundColor?: string;
  borderRadius?: string;
  border?: IBorderValue;

  enableStyleOnReadonly?: boolean;
}

/** Table component props */
export interface ITableComponentProps extends ITableComponentBaseProps, IConfigurableFormComponent {}
