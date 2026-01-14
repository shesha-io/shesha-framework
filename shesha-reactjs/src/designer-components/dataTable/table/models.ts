import { IShaDataTableInlineEditableProps, TableSelectionMode } from '@/components/dataTable/interfaces';
import { IConfigurableActionConfiguration } from '@/providers';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { ICommonContainerProps } from '../../container/interfaces';
import { IBorderValue } from '@/designer-components/_settings/utils/border/interfaces';
import { IShadowValue } from '@/designer-components/_settings/utils/shadow/interfaces';
import { ComponentDefinition } from '@/interfaces';

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
  headerFont?: {
    type?: string;
    size?: number;
    weight?: string;
    color?: string;
    align?: string;
  };
  headerBackgroundColor?: string;

  // Deprecated header font properties - kept for backward compatibility
  /** @deprecated Use headerFont.type instead */
  headerFontFamily?: string;
  /** @deprecated Use headerFont.size instead */
  headerFontSize?: string;
  /** @deprecated Use headerFont.weight instead */
  headerFontWeight?: string;
  /** @deprecated Use headerFont.color instead */
  headerTextColor?: string;

  // Table body styling
  rowBackgroundColor?: string;
  rowAlternateBackgroundColor?: string;
  rowHoverBackgroundColor?: string;
  rowSelectedBackgroundColor?: string;

  // Row dimensions
  rowDimensions?: {
    height?: string;
    minHeight?: string;
    maxHeight?: string;
  };

  // Row padding (individual fields)
  rowPaddingTop?: string;
  rowPaddingRight?: string;
  rowPaddingBottom?: string;
  rowPaddingLeft?: string;

  // Row padding using styling box
  /** @deprecated Use rowPaddingTop, rowPaddingRight, rowPaddingBottom, rowPaddingLeft instead */
  rowStylingBox?: {
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
    padding?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
  };

  // Row border using standard border controls
  rowBorderStyle?: IBorderValue;

  // Deprecated properties - kept for backward compatibility
  /** @deprecated Use rowDimensions.height instead */
  rowHeight?: string;
  /** @deprecated Use rowStylingBox.padding instead */
  rowPadding?: string;
  /** @deprecated Use rowBorderStyle instead */
  rowBorder?: string;

  // Overall table styling
  borderRadius?: string;
  border?: IBorderValue;
  backgroundColor?: string;
  boxShadow?: string;
  shadow?: IShadowValue;
  sortableIndicatorColor?: string;
  enableStyleOnReadonly?: boolean;

  // Cell-specific styling
  cellTextColor?: string;
  cellBackgroundColor?: string;
  cellBorderColor?: string;
  /** @deprecated Use rowStylingBox instead. This property is migrated to rowStylingBox in migration v19 */
  cellPadding?: string;
  cellBorder?: IBorderValue;

  // Footer styling
  footerBackgroundColor?: string;
  footerTextColor?: string;
  footerBorder?: IBorderValue;

  // Additional borders and shadows
  headerBorder?: IBorderValue;
  headerShadow?: IShadowValue;
  rowShadow?: IShadowValue;

  // Layout features
  cellBorders?: boolean; // Show/hide cell borders
  rowDividers?: boolean; // Horizontal dividers between rows
  responsiveMode?: 'scroll' | 'stack' | 'collapse';

  // Table settings nested structure for form binding
  tableSettings?: {
    rowHeight?: string;
    rowPadding?: string;
    rowBorder?: string;
    headerFontSize?: string;
    headerFontWeight?: string;
  };
}

/** Table component props */
export interface ITableComponentProps extends ITableComponentBaseProps, IConfigurableFormComponent {}

export type TableComponentDefinition = ComponentDefinition<"datatable", ITableComponentProps>;
