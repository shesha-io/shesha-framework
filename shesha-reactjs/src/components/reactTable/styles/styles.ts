import { createStyles, SerializedStyles } from 'antd-style';
import { IBorderValue } from '@/designer-components/_settings/utils/border/interfaces';
import { IShadowValue } from '@/designer-components/_settings/utils/shadow/interfaces';
import { getBorderStyle } from '@/designer-components/_settings/utils/border/utils';
import { getShadowStyle } from '@/designer-components/_settings/utils/shadow/utils';

const tableClassNames = {
  shaTable: 'sha-table',
  thead: 'thead',
  tbody: 'tbody',
  tr: 'tr',
  th: 'th',
  td: 'td',
  trHead: 'tr-head',
  trBody: 'tr-body',
  shaCrudCell: 'sha-crud-cell',
  shaNewRow: 'sha-new-row',
  trBodyGhost: 'tr-body-ghost',
  trOdd: 'tr-odd',
  sortedAsc: 'sorted-asc',
  sortedDesc: 'sorted-desc',
  fixedColumn: 'fixed-column',
  relativeColumn: 'relative-column',
  boxShadowLeft: 'box-shadow-left',
  boxShadowRight: 'box-shadow-right',
  trSelected: 'sha-tr-selected',
  shaTableEmpty: 'sha-table-empty',
  shaSortable: 'sha-sortable',
  shaDragging: 'sha-dragging',
  shaTooltipIcon: 'sha-tooltip-icon',
  shaCellParent: 'sha-cell-parent',
  shaCellParentFW: 'sha-cell-parent-fw', // Full width cell parent, used for cells that should take full width of the row,
  shaSpanCenterVertically: 'sha-span-center-vertically',
};
const tableStyles = {
  styles: tableClassNames,
};

export const useStyles = (): typeof tableStyles => {
  return tableStyles;
};

export const useMainStyles = createStyles(({ css, cx, token, prefixCls, iconPrefixCls }, {
  rowBackgroundColor,
  rowAlternateBackgroundColor,
  rowHoverBackgroundColor,
  rowSelectedBackgroundColor,
  border,
  backgroundColor,
  headerFontFamily,
  headerFontSize,
  headerFontWeight,
  headerBackgroundColor,
  headerTextColor,
  headerTextAlign,
  bodyTextAlign,
  rowHeight,
  rowPadding,
  rowBorder,
  rowBorderStyle,
  boxShadow,
  sortableIndicatorColor,
  striped: _striped,
  cellTextColor,
  cellBackgroundColor,
  cellBorderColor,
  cellBorders,
  headerBorder,
  cellBorder,
  headerShadow,
  rowShadow,
  rowDividers,
  bodyFontFamily,
  bodyFontSize,
  bodyFontWeight,
  bodyFontColor,
}: {
  rowBackgroundColor?: string;
  rowAlternateBackgroundColor?: string;
  rowHoverBackgroundColor?: string;
  rowSelectedBackgroundColor?: string;
  border?: IBorderValue;
  backgroundColor?: string;
  headerFontFamily?: string;
  headerFontSize?: string;
  headerFontWeight?: string;
  headerBackgroundColor?: string;
  headerTextColor?: string;
  headerTextAlign?: string;
  bodyTextAlign?: string;
  rowHeight?: string;
  rowPadding?: string;
  rowBorder?: string;
  rowBorderStyle?: IBorderValue;
  boxShadow?: string;
  sortableIndicatorColor?: string;
  striped?: boolean;
  cellTextColor?: string;
  cellBackgroundColor?: string;
  cellBorderColor?: string;
  cellBorders?: boolean;
  cellPadding?: string;
  headerBorder?: IBorderValue;
  cellBorder?: IBorderValue;
  headerShadow?: IShadowValue;
  rowShadow?: IShadowValue;
  rowDividers?: boolean;
  bodyFontFamily?: string;
  bodyFontSize?: string;
  bodyFontWeight?: string;
  bodyFontColor?: string;
}) => {
  const {
    shaTable,
    thead,
    tbody,
    tr,
    th,
    td,
    trHead,
    trBody,
    shaCrudCell,
    shaNewRow,
    trBodyGhost,
    trOdd,
    sortedAsc,
    fixedColumn,
    relativeColumn,
    boxShadowRight,
    boxShadowLeft,
    sortedDesc,
    trSelected,
    shaTableEmpty,
    shaSortable,
    shaDragging,
    shaTooltipIcon,
    shaCellParent,
    shaCellParentFW,
    shaSpanCenterVertically,
  } = tableClassNames;

  const borderStyles = getBorderStyle(border || {}, {});
  const headerBorderStyles = getBorderStyle(headerBorder || {}, {});
  const cellBorderStyles = getBorderStyle(cellBorder || {}, {});
  const headerShadowStyles = getShadowStyle(headerShadow);
  const rowShadowStyles = getShadowStyle(rowShadow);

  const effectivePadding = rowPadding;

  const hasBorderRadius = border?.radius && (
    (border.radius.all && parseFloat(String(border.radius.all)) !== 0) ||
    (border.radius.topLeft && parseFloat(String(border.radius.topLeft)) !== 0) ||
    (border.radius.topRight && parseFloat(String(border.radius.topRight)) !== 0) ||
    (border.radius.bottomLeft && parseFloat(String(border.radius.bottomLeft)) !== 0) ||
    (border.radius.bottomRight && parseFloat(String(border.radius.bottomRight)) !== 0)
  );

  // var(--ant-primary-3)
  const hoverableRow = rowHoverBackgroundColor ? `
        &:not(.${trSelected}) {
            background: ${rowHoverBackgroundColor} !important;
        }
    ` : '';

  const groupBorder = '1px solid lightgray';
  const nestedPaddings = (indexStart: number, index: number): SerializedStyles | null => {
    return indexStart < index
      ? css`
          &.sha-group-level-${indexStart} {
            > .${prefixCls}-collapse-item {
              > .${prefixCls}-collapse-header {
                margin-left: ${indexStart * 15}px;
                border-bottom: ${groupBorder};
                border-radius: unset;

                ${indexStart > 0 ? `border-left: ${groupBorder};` : ''}
                ${indexStart === 0 ? `border-top: ${groupBorder};` : ''}
              }
            }
          }
          ${nestedPaddings(indexStart + 1, index)}
        `
      : null;
  };


  // .sha-react-table
  const shaReactTable = cx(
    'sha-react-table',
    css`
      background: white;
      /* These styles are suggested for the table fill all available space in its containing element */
      display: block;
      /* These styles are required for a horizontaly scrollable table overflow */
      overflow: ${boxShadow ? 'visible' : 'auto'};
      ${boxShadow ? `
        /* Apply box shadow to container */
        box-shadow: ${boxShadow};
        /* Add margin to create space for shadow without affecting table width */
        margin: 8px;
        /* Remove margin from parent to compensate */
        position: relative;
      ` : ''}

      .${shaSpanCenterVertically} {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
      .anticon svg{
        margin-top: 3px !important;
      }

      .${shaTable} {
        border-spacing: 0;
        display: inline-block;
        min-width: 100%;
        background-color: ${backgroundColor};

        /* Apply border styles to the inner table */
        ${Object.entries(borderStyles).map(([key, value]) => {
          // Convert camelCase CSS properties to kebab-case
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          return `${cssKey}: ${value};`;
        }).join('\n')}

        /* When border-radius is present, clip content but not shadows */
        /* Only apply to tables without fixed columns since overflow affects position:sticky */
        &:not(:has(.${fixedColumn})) {
          ${hasBorderRadius ? `
            border-radius: inherit;
            > .${thead}, > .${tbody} {
              overflow: hidden;
            }
          ` : ''}
        }

        .${thead} {
          /* These styles are required for a scrollable body to align with the header properly */
          overflow-y: auto;
          overflow-x: hidden;
        }
        .${tbody} {
          overflow-x: hidden;
          ${backgroundColor ? `background-color: ${backgroundColor};` : ''}

          > .${shaSortable}:not(.${shaDragging}) {
            .${tr}.${trBody}:hover {
              ${hoverableRow}
            }
          }

          > .${tr}.${trBody}:hover {
            ${hoverableRow}
          }

          .${shaTableEmpty} {
            display: flex;
            height: 250px;
            justify-content: center;
            align-items: center;
          }

          //
          .${prefixCls}-collapse {
            border: none;

            .${prefixCls}-collapse-item {
              border: none;

              .${prefixCls}-collapse-header {
                padding-top: unset !important;
                padding-bottom: unset !important;
                font-weight: normal;
                font-size: 14px;
                min-height: 30px;
                display: flex !important;
                align-items: center !important;
              }

              .${prefixCls}-collapse-content {
                .${prefixCls}-collapse-content-box {
                  padding: unset;

                  div.tr.tr-body:last-child {
                    border-bottom: ${groupBorder};
                  }
                }
              }
            }

            ${nestedPaddings(0, 9)}
          }
        }
        .${tr} {
          ${rowHeight ? `height: ${rowHeight};` : 'height: auto;'}
          ${(() => {
            // Prefer rowBorderStyle over rowBorder for full border control
            if (rowBorderStyle) {
              const borderStyles = getBorderStyle(rowBorderStyle, {});
              return Object.entries(borderStyles)
                .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
                .join(' ');
            }
            // Fallback to simple border string
            return rowBorder ? `border: ${rowBorder};` : '';
          })()}

          &.${trHead} {
            box-shadow: 0 2px 15px 0 rgb(0 0 0 / 15%);
            ${headerBackgroundColor ? `background-color: ${headerBackgroundColor} !important;` : `background-color: ${backgroundColor} !important;`}
            ${headerFontFamily ? `font-family: ${headerFontFamily};` : ''}
            ${headerFontSize ? `font-size: ${headerFontSize};` : ''}
            ${headerFontWeight ? `font-weight: ${headerFontWeight} !important;` : ''}
            ${headerTextColor ? `color: ${headerTextColor};` : ''}
            ${Object.entries(headerBorderStyles).map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`).join(' ')}
            ${Object.entries(headerShadowStyles || {}).map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`).join(' ')}

            /* Apply text alignment to header cells */
            .${th} {
              ${headerTextAlign ? `text-align: ${headerTextAlign} !important;` : ''}
            }

            /* Apply header background to relative columns within headers */
            .${relativeColumn} {
              ${headerBackgroundColor ? `background-color: ${headerBackgroundColor} !important;` : `background-color: ${backgroundColor} !important;`}
            }
          }

          &.${trBody} {
            ${rowBackgroundColor ? `background: ${rowBackgroundColor} !important;` : ''}
            ${Object.entries(rowShadowStyles || {}).map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`).join(' ')}
            ${rowDividers ? `border-bottom: 1px solid ${token.colorBorderSecondary};` : ''}

            /* Apply text alignment to body cells */
            .${td} {
              ${bodyTextAlign ? `text-align: ${bodyTextAlign} !important;` : ''}
            }

            /* Make dropdowns transparent to inherit row background by default */
            /* Can be overridden by component-level appearance settings */
            .ant-select-selector,
            .ant-input,
            .ant-picker,
            .ant-input-number-input-wrap,
            .ant-input-number {
              background: transparent;
              background-color: transparent;
            }
          }

          .${td} {
            vertical-align: middle;
            ${cellTextColor ? `color: ${cellTextColor};` : ''}
            ${cellBackgroundColor ? `background-color: ${cellBackgroundColor};` : ''}
            ${cellBorders && cellBorderColor ? `border: 1px solid ${cellBorderColor};` : ''}
            ${Object.entries(cellBorderStyles).map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`).join(' ')}
            ${bodyTextAlign ? `text-align: ${bodyTextAlign};` : ''}
          }

          .${th} {
            vertical-align: middle;
            ${headerTextAlign ? `text-align: ${headerTextAlign};` : ''}
          }

          .${shaCrudCell} {
            display: flex;
            width: 100%;
            min-height: 22px;
            height: 100%;
            justify-content: center;
            align-items: center;
            ${bodyFontFamily ? `font-family: ${bodyFontFamily};` : ''}
            ${bodyFontSize ? `font-size: ${bodyFontSize};` : ''}
            ${bodyFontWeight ? `font-weight: ${bodyFontWeight};` : ''}
            ${bodyFontColor ? `color: ${bodyFontColor};` : ''}

            .sha-link {
              border: none;
              padding: 0 5px;
              width: auto;
              height: auto;

              .${iconPrefixCls} {
                font-size: ${bodyFontSize || '16px'};
                width: ${bodyFontSize || '16px'};
                min-width: ${bodyFontSize || '16px'};
              }
            }
            .sha-action-button {
              display: flex;
              width: auto;
              justify-content: center;
              align-items: center;

              .${iconPrefixCls} {
                font-size: ${bodyFontSize || '16px'};
                width: ${bodyFontSize || '16px'};
                min-width: ${bodyFontSize || '16px'};
              }
            }
          }

          &.${shaNewRow} {
            display: flex;
            justify-content: center;
            align-items: center;
            height: -webkit-fill-available !important;
            border-top: 0.5px solid rgb(220, 220, 220) !important;
            border-bottom: 0.5px solid rgb(218, 218, 218) !important;
            
            .${shaCrudCell} {
              height: -webkit-fill-available !important;

              .sha-link {
                .${iconPrefixCls} {
                  font-size: 18px;
                  width: 18px;
                  min-width: 18px;
                }
              }
            }
          }

          &.${trBodyGhost} {
            border: 1px dashed ${token.colorPrimary};
            border-radius: 2px;
            opacity: 0.7;
          }

          &.${trOdd} {
            ${(rowAlternateBackgroundColor || rowBackgroundColor) ? `background: ${rowAlternateBackgroundColor || rowBackgroundColor} !important;` : ''}

            /* Make dropdowns transparent to inherit row background by default */
            /* Can be overridden by component-level appearance settings */
            .ant-select-selector,
            .ant-input,
            .ant-picker,
            .ant-input-number-input-wrap,
            .ant-input-number {
              background: transparent;
              background-color: transparent;
            }
          }

          &.${trSelected} {
            .sha-link {
              color: white;
            }
            background: ${rowSelectedBackgroundColor || token.colorPrimary} !important;
            color: white;

            .ant-form-item-control-input-content, button, a {
                    color: white;
              }

            .sha-form-cell{
              .ant-form-item-control-input-content, a, button {
                  color: inherit;
              }

              .sha-stored-files-renderer, .ant-upload-list {
                  color: white;
              }

            }

            /* Remove white background from dropdowns in selected rows */
            .ant-select-selector,
            .ant-input,
            .ant-picker,
            .ant-input-number-input-wrap,
            .ant-input-number {
              background: transparent !important;
              background-color: transparent !important;
            }

            /* Ensure dropdown text is white in selected rows */
            .ant-select-selection-item,
            .ant-select-selection-placeholder {
              color: white !important;
            }
          }

          /* Ensure selected row styling always takes priority over striped rows */
          &.${trOdd}.${trSelected} {
            background: ${rowSelectedBackgroundColor || token.colorPrimary} !important;
            color: white;
          }

          .${prefixCls}-form-item {
            .${prefixCls}-form-item-row {
              .${prefixCls}-form-item-control {
                .${prefixCls}-form-item-control-input {
                  min-height: unset;

                  .${prefixCls}-btn.entity-reference-btn {
                    line-height: unset;
                    height: unset;
                  }
                }
              }
            }
          }

          .${shaCellParent} {
              min-width: 100%;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              cursor: auto;

              & .ant-form-item-control-input {
                overflow: visible;
                position: relative;
                z-index: 999;
                width: 100% !important;
              }
              
              /* Override vertical alignment for form controls in table cells */
              & .ant-select,
              & .ant-input,
              & .ant-input-number,
              & .ant-picker {
                vertical-align: middle !important;
              }
          }

          .${shaCellParentFW} {
              min-width: 100%;
              & .ant-form-item-control-input {
                overflow: visible;
                position: relative;
                z-index: 999;
                width: 100% !important;
              }
              
              /* Override vertical alignment for form controls in table cells */
              & .ant-select,
              & .ant-input,
              & .ant-input-number,
              & .ant-picker {
                vertical-align: middle !important;
              }
          }

        }
        .${shaTooltipIcon} {
          color: darkgray !important;
          margin-left: 5px;
          margin-right: 5px;
        }
        .${th} {
          ${headerBackgroundColor ? `background-color: ${headerBackgroundColor} !important;` : ''}
          ${headerFontFamily ? `font-family: ${headerFontFamily};` : ''}
          ${headerFontSize ? `font-size: ${headerFontSize};` : ''}
          ${headerFontWeight ? `font-weight: ${headerFontWeight} !important;` : ''}
          ${headerTextColor ? `color: ${headerTextColor};` : ''}

          &.${sortedAsc} {
            border-top: 3px solid ${sortableIndicatorColor || token.colorPrimary};
            padding-top: 5px;
          }
          &.${sortedDesc} {
            border-bottom: 3px solid ${sortableIndicatorColor || token.colorPrimary};
          }
          &.${fixedColumn} {
            position: sticky;
            z-index: 999;
            opacity: 1;
          }
          &.${relativeColumn} {
            display: inline-block;
            position: relative;
            z-index: -100;
          }

          &.${boxShadowLeft} {
            box-shadow: 5px 0 3px -2px #ccc;
          }
          &.${boxShadowRight} {
            box-shadow: -5px 0 3px -2px #ccc;
          }

          &.ellipsis {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        /* Single source of truth for cell padding - applies to both headers and data cells */
        .${th}, .${td} {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
          /* Use effectivePadding from props (rowStylingBox or cellPadding) or default to 0.5rem */
          ${effectivePadding ? `padding: ${effectivePadding};` : 'padding: 0.5rem;'}
          border-right: 1px solid rgba(0, 0, 0, 0.05);

          /* In this example we use an absolutely position resizer, so this is required. */
          position: relative;

          /* Allow overflow for cells with forms to show validation messages */
          &:has(.sha-form-cell) {
            overflow: visible;
          }

          .resizer {
            /* prevents from scrolling while dragging on touch devices */
            /* touch-action :none; */

            &.isResizing {
              border-right: 1px solid gray;
            }

            height: 100%;
            border-right: 1px solid rgba(0, 0, 0, 0.05);
            touch-action: none;
            display: inline-block;
            position: absolute;
            width: 5px;
            top: 0;
            bottom: 0;
            right: -0.5px;
            cursor: col-resize;
            z-index: 10;
          }
          &.${fixedColumn} {
            position: sticky;
            z-index: 10;
            opacity: 1;
            .sha-link {
              color: ${token.colorPrimary};
            }
          }
          &.${relativeColumn} {
            display: inline-block;
            position: relative;
            z-index: 0;
          }
          &.${boxShadowLeft} {
            box-shadow: 5px 0 3px -2px #ccc;
          }
          &.${boxShadowRight} {
            box-shadow: -5px 0 3px -2px #ccc;
          }
        }
      }
    `,


  );
  return {
    shaReactTable,
  };
});
