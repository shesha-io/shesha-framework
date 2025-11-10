import { IShaDataTableInlineEditableProps, TableSelectionMode } from '@/components/dataTable/interfaces';
import { IConfigurableActionConfiguration } from '@/providers';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { ICommonContainerProps } from '../../container/interfaces';
import { IBorderValue } from '@/designer-components/_settings/utils/border/interfaces';

export type RowDroppedMode = 'executeScript' | 'showDialog';

export interface ITableComponentBaseProps extends IShaDataTableInlineEditableProps, Omit<ICommonContainerProps, 'style'> {
  items: IConfigurableColumnsProps[];
  useMultiselect?: boolean;
  selectionMode?: TableSelectionMode;
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

  // Header styling
  headerFontSize?: string;
  headerFontWeight?: string;
  headerBackgroundColor?: string;
  headerTextColor?: string;

  // Table body styling
  rowBackgroundColor?: string;
  rowAlternateBackgroundColor?: string;
  rowHoverBackgroundColor?: string;
  rowSelectedBackgroundColor?: string;
  rowHeight?: string;
  rowPadding?: string;
  rowBorder?: string;

  // Overall table styling
  borderRadius?: string;
  border?: IBorderValue;
  backgroundColor?: string;
  boxShadow?: string;
  sortableIndicatorColor?: string;
  enableStyleOnReadonly?: boolean;
}

/** Table component props */
export interface ITableComponentProps extends ITableComponentBaseProps, IConfigurableFormComponent {}
