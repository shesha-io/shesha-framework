import { IShaDataTableInlineEditableProps, TableSelectionMode } from '@/components/dataTable/interfaces';
import { IConfigurableActionConfiguration, IInputStyles } from '@/providers';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { ICommonContainerProps } from '../../container/interfaces';
import { IBorderValue } from '@/designer-components/_settings/utils/border/interfaces';
import { IShadowValue } from '@/designer-components/_settings/utils/shadow/interfaces';
import { ComponentDefinition } from '@/interfaces';
import { IDimensionsValue } from '@/designer-components/_settings/utils/dimensions/interfaces';

export type RowDroppedMode = 'executeScript' | 'showDialog';

export type TableDeviceStyles = IInputStyles & {
  rowDimensions?: IDimensionsValue | undefined;
  rowHeight?: string | undefined;
};

export interface ITableComponentBaseProps extends IShaDataTableInlineEditableProps, Omit<ICommonContainerProps, 'style'> {
  items: IConfigurableColumnsProps[];
  selectionMode?: TableSelectionMode | undefined;
  freezeHeaders?: boolean | undefined;
  showExpandedView?: boolean | undefined;
  containerStyle?: string | undefined;
  tableStyle?: string | undefined;
  minHeight?: number | undefined;
  maxHeight?: number | undefined;
  noDataText?: string | undefined;
  noDataSecondaryText?: string | undefined;
  noDataIcon?: string | undefined;
  dblClickActionConfiguration?: IConfigurableActionConfiguration | undefined;

  onRowClick?: IConfigurableActionConfiguration | undefined;
  onRowDoubleClick?: IConfigurableActionConfiguration | undefined;
  onRowHover?: IConfigurableActionConfiguration | undefined;
  onRowSelect?: IConfigurableActionConfiguration | undefined;
  onSelectionChange?: IConfigurableActionConfiguration | undefined;

  striped?: boolean | undefined;
  hoverHighlight?: boolean | undefined;

  // Header styling
  headerFont?: {
    type?: string | undefined;
    size?: number | undefined;
    weight?: string | undefined;
    color?: string | undefined;
    align?: string | undefined;
  } | undefined;
  headerBackgroundColor?: string | undefined;

  // Deprecated header font properties - kept for backward compatibility
  /** @deprecated Use headerFont.type instead */
  headerFontFamily?: string | undefined;
  /** @deprecated Use headerFont.size instead */
  headerFontSize?: string | undefined;
  /** @deprecated Use headerFont.weight instead */
  headerFontWeight?: string | undefined;
  /** @deprecated Use headerFont.color instead */
  headerTextColor?: string | undefined;

  // Table body styling
  rowBackgroundColor?: string | undefined;
  rowAlternateBackgroundColor?: string | undefined;
  rowHoverBackgroundColor?: string | undefined;
  rowSelectedBackgroundColor?: string | undefined;

  // Row dimensions
  rowDimensions?: {
    height?: string | number | undefined;
    minHeight?: string | number | undefined;
    maxHeight?: string | number | undefined;
  } | undefined;

  // Row padding (individual fields)
  rowPaddingTop?: string | undefined;
  rowPaddingRight?: string | undefined;
  rowPaddingBottom?: string | undefined;
  rowPaddingLeft?: string | undefined;

  // Row padding using styling box
  /** @deprecated Use rowPaddingTop, rowPaddingRight, rowPaddingBottom, rowPaddingLeft instead */
  rowStylingBox?: {
    margin?: {
      top?: string | undefined;
      right?: string | undefined;
      bottom?: string | undefined;
      left?: string | undefined;
    } | undefined;
    padding?: {
      top?: string | undefined;
      right?: string | undefined;
      bottom?: string | undefined;
      left?: string | undefined;
    } | undefined;
  };

  // Row border using standard border controls
  rowBorderStyle?: IBorderValue | undefined;

  // Deprecated properties - kept for backward compatibility
  /** @deprecated Use rowDimensions.height instead */
  rowHeight?: string | undefined;
  /** @deprecated Use rowStylingBox.padding instead */
  rowPadding?: string | undefined;
  /** @deprecated Use rowBorderStyle instead */
  rowBorder?: string | undefined;

  // Overall table styling
  borderRadius?: string | undefined;
  border?: IBorderValue | undefined;
  backgroundColor?: string | undefined;
  boxShadow?: string | undefined;
  shadow?: IShadowValue | undefined;
  sortableIndicatorColor?: string | undefined;
  enableStyleOnReadonly?: boolean | undefined;

  // Cell-specific styling
  /** @deprecated Use bodyFontColor (via font.color) instead. Cell text color duplicates body font color. */
  cellTextColor?: string | undefined;
  /** @deprecated Use rowBackgroundColor instead. Cell background color duplicates row background color. */
  cellBackgroundColor?: string | undefined;
  cellBorderColor?: string | undefined;
  /** @deprecated Use rowStylingBox instead. This property is migrated to rowStylingBox in migration v19 */
  cellPadding?: string | undefined;
  cellBorder?: IBorderValue | undefined;

  // Footer styling
  footerBackgroundColor?: string | undefined;
  footerTextColor?: string | undefined;
  footerBorder?: IBorderValue | undefined;

  // Additional borders and shadows
  headerBorder?: IBorderValue | undefined;
  headerShadow?: IShadowValue | undefined;
  rowShadow?: IShadowValue | undefined;

  // Layout features
  cellBorders?: boolean | undefined; // Show/hide cell borders
  rowDividers?: boolean | undefined; // Horizontal dividers between rows
  responsiveMode?: 'scroll' | 'stack' | 'collapse' | undefined;

  actionIconSize?: string | number | undefined; // Icon size for action columns (inherits from bodyFontSize if not set)
  actionIconColor?: string | undefined; // Icon color for action columns

  // Table settings nested structure for form binding
  tableSettings?: {
    rowHeight?: string | undefined;
    rowPadding?: string | undefined;
    rowBorder?: string | undefined;
    headerFontSize?: string | undefined;
    headerFontWeight?: string | undefined;
  } | undefined;
}

interface LegacyITableComponentBaseProps {
  /** @deprecated */
  useMultiselect?: boolean;
  /** @deprecated */
  crud?: boolean;
  /** @deprecated */
  flexibleHeight?: boolean;
};

/** Table component props */
export interface ITableComponentProps extends ITableComponentBaseProps, LegacyITableComponentBaseProps, IConfigurableFormComponent<TableDeviceStyles> {}

export type TableComponentDefinition = ComponentDefinition<"datatable", ITableComponentProps>;
