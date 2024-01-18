import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx, token, prefixCls, iconPrefixCls }) => {
    const genClass = (className: string): string => cx(`${className}`);

    const shaTable = genClass("sha-table");
    const thead = genClass("thead");
    const tbody = genClass("tbody");
    const tr = genClass("tr");
    const th = genClass("th");
    const td = genClass("td");
    // .tr-head
    const trHead = genClass("tr-head");
    const trBody = genClass("tr-body");

    // .sha-crud-cell
    const shaCrudCell = genClass("sha-crud-cell");
    // .sha-new-row
    const shaNewRow = genClass("sha-new-row");
    // .tr-body-ghost
    const trBodyGhost = genClass("tr-body-ghost");
    // .tr-odd
    const trOdd = genClass("tr-odd");

    // .sorted-asc
    const sortedAsc = genClass("sorted-asc");
    const sortedDesc = genClass("sorted-desc");

    // .sha-tr-selected
    const trSelected = genClass("sha-tr-selected");
    // .sha-table-empty
    const shaTableEmpty = genClass("sha-table-empty");

    // var(--ant-primary-3)
    const hoverableRow = `
        &:not(.${trSelected}) {
            background: ${token.colorPrimaryBgHover} !important;
        }
    `;
    
    // .sha-sortable
    const shaSortable = genClass("sha-sortable");
    // .sha-dragging
    const shaDragging = genClass("sha-dragging");
    // .sha-hover
    const shaHover = genClass("sha-hover");

    const groupBorder = "1px solid lightgray";
    const nestedPaddings = (indexStart: number, index: number) => {
      return indexStart < index 
      ? css`
        &.sha-group-level-${indexStart} {
          >.${prefixCls}-collapse-item {
            >.${prefixCls}-collapse-header {
              margin-left: ${indexStart * 15}px;
              border-bottom: ${groupBorder};
              border-radius: unset;
      
              ${indexStart > 0 ? `border-left: ${groupBorder};` : ""}
              ${indexStart === 0 ? `border-top: ${groupBorder};` : ""}
            }
          }
        }
        ${nestedPaddings(indexStart + 1, index)}
      `
      : null;
    };

    // .sha-react-table
    const shaReactTable = cx("sha-react-table", css`
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

                >.${shaSortable}:not(.${shaDragging}) {
                  .${tr}.${trBody}.${shaHover} {
                    ${hoverableRow}
                  }
                }
          
                >.${tr}.${trBody}.${shaHover} {
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
                    border: 1px dashed #4099ff;
                    border-radius: 2px;
                    opacity: 0.7;
                }

                &.${trOdd} {
                    background: rgba(0, 0, 0, 0.03);
                }

                &.${trSelected} {
                    .sha-link {
                        color: white;
                      }
              
                    background: ${token.colorPrimary};
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
            }
            .${th} {
                &.${sortedAsc} {
                    border-top: 3px solid ${token.colorPrimary};
                    padding-top: 5px;
                }
                &.${sortedDesc} {
                    border-bottom: 3px solid ${token.colorPrimary};
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
            }
        }
    `);
    return {
        shaReactTable,
        shaTable,
        shaTableEmpty,
        thead,
        tbody,
        tr,
        trHead,
        trBody,
        th,
        td,
        sortedAsc,
        sortedDesc,
        shaSortable,
        trOdd,
        trSelected,
        shaHover,
    };
});