import { createStyles } from 'antd-style';

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
  shaCellParentFW: 'sha-cell-parent-fw', // Full width cell parent, used for cells that should take full width of the row
};
const tableStyles = {
  styles: tableClassNames,
};

export const useStyles = () => {
  return tableStyles;
};

export const useMainStyles = createStyles(({ css, cx, token, prefixCls, iconPrefixCls }) => {
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
  } = tableClassNames;

  // var(--ant-primary-3)
  const hoverableRow = `
        &:not(.${trSelected}) {
            background: ${token.colorPrimaryBgHover} !important;
        }
    `;

  const groupBorder = '1px solid lightgray';
  const nestedPaddings = (indexStart: number, index: number) => {
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
      margin: 0 12px;
      background: white;
      /* These styles are suggested for the table fill all available space in its containing element */
      display: block;
      /* These styles are required for a horizontaly scrollable table overflow */
      overflow: auto;

      .${shaTable} {
        border-spacing: 0;
        border: 1px solid #ddd;
        display: inline-block;
        min-width: 100%;

        .${thead} {
          /* These styles are required for a scrollable body to align with the header properly */
          overflow-y: auto;
          overflow-x: hidden;
        }
        .${tbody} {
          overflow-x: hidden;

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
          &.${trHead} {
            box-shadow: 0 2px 15px 0 rgb(0 0 0 / 15%);
          }

          .${shaCrudCell} {
            display: flex;
            width: 100%;
            min-height: 22px;
            justify-content: center;

            .sha-link {
              border: none;
              padding: 0 5px;
              width: auto;
              height: auto;

              .${iconPrefixCls} {
                font-size: 14px;
                width: 14px;
                min-width: 14px;
              }
            }
            .sha-action-button {
              display: flex;
              width: auto;
              justify-content: center;
              align-items: center;
            }
          }

          &.${shaNewRow} {
            .${shaCrudCell} {
              height: 100%;

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
            background: #f0f0f0;
          }

          &.${trSelected} {
            .sha-link {
              color: white;
            }
            background: ${token.colorPrimary};
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
              cursor: pointer;

              & .ant-form-item-control-input {
                overflow: visible;
                position: relative;
                z-index: 999;
                width: calc(135% - 2px) !important;
              }
          }

          .${shaCellParentFW} {
              min-width: 100%;
              & .ant-form-item-control-input {
                overflow: visible;
                position: relative;
                z-index: 999;
                width: calc(135% - 2px) !important;
              }
          }

        }
        .${shaTooltipIcon} {
          color: darkgray !important;
          margin-left: 5px;
          margin-right: 5px;
        }
        .${th} {
          &.${sortedAsc} {
            border-top: 3px solid ${token.colorPrimary};
            padding-top: 5px;
          }
          &.${sortedDesc} {
            border-bottom: 3px solid ${token.colorPrimary};
          }
          &.${fixedColumn} {
            display: inline-block;
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
        }

        .${th}, .${td} {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
          padding: 0.5rem;
          border-right: 1px solid rgba(0, 0, 0, 0.05);

          /* In this example we use an absolutely position resizer, so this is required. */
          position: relative;

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
            display: inline-block;
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
    `
  );
  return {
    shaReactTable,
  };
});
