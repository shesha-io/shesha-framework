import { IShaDataTableInlineEditableProps } from '@/components/dataTable/interfaces';
import { IConfigurableActionConfiguration } from '@/providers';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { CSSProperties } from 'react';

export type RowDroppedMode = 'executeScript' | 'showDialog';

export interface ITableComponentBaseProps extends IShaDataTableInlineEditableProps {
  items: IConfigurableColumnsProps[];
  useMultiselect?: boolean;
  freezeHeaders?: boolean;
  containerStyle?: string;
  tableStyle?: string;
  minHeight?: number;
  maxHeight?: number;
  width?: number;
  tableHeight?: number;
  noDataText?: string;
  noDataSecondaryText?: string;
  noDataIcon?: string;
  toggleZebraStripes?: boolean;
  sortIndicator?: string;

  onRowClick?: IConfigurableActionConfiguration;
  onRowDblClick?: IConfigurableActionConfiguration;
  onRowSelect?: IConfigurableActionConfiguration;
  backgroundColor?: string;
  overflowX?:  CSSProperties['overflowX'];
  overflowY?: CSSProperties['overflowY'];
  borderRadius?: number;

  borderWidth?: number;
  borderStyle?: CSSProperties['borderStyle'];
  borderColor?: string;

  tableFontSize?: number;
  fontColor?: string;

  fontFamily?: string;
  headerFontSize?: number;

  zebraStripeColor?: string;
  hoverHighlight?: string;
  rowSelectedColor?: string;

  rowBackgroundColor?: string;
  rowHoverColor?: string;
  rowBorder?: string;
  rowPadding?: number;
  rowHeight?: number;

  headerHeight?: number;
  headerBackgroundColor?: string;
  headerTextColor?: string;
  headerBorder?: string;

  boxShadowX?: number;
  boxShadowY?: number;
  boxShadowBlur?: string;
  boxShadowSpread?: string;
  boxShadowColor?: string;
  boxShadowInset?: boolean;
}

/** Table component props */
export interface ITableComponentProps extends ITableComponentBaseProps, IConfigurableFormComponent {}
