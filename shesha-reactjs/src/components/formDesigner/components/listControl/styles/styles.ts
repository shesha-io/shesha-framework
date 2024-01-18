import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx, token, prefixCls }) => {
    const shaResponsiveButtonGroup = "sha-responsive-button-group";
    const shaListComponentItemCheckbox = "sha-list-component-item-checkbox";
    const shaListComponentDivider = "sha-list-component-divider";
    const shaListComponentExtra = "sha-list-component-extra";
    const shaListComponentExtraSpace = "sha-list-component-extra-space";
    const shaListComponentPanel = "sha-list-component-panel";
    const shaResponsiveButtonGroupContainer = "sha-responsive-button-group-container";
    const shaResponsiveButtonGroupInlineContainer = "sha-responsive-button-group-inline-container";
    const shaListComponentBody = "sha-list-component-body";
    const shaListComponentAddItemBtn = "sha-list-component-add-item-btn";
    const shaListComponentItem = "sha-list-component-item";
    const shaListPaginationContainer = "sha-list-pagination-container";

    const shaListComponent = cx("sha-list-component", css`
        .${shaResponsiveButtonGroup} {
          min-width: unset !important;
        }
      
        .${prefixCls}-collapse-extra {
          margin: unset !important;
        }
      
        .${shaListComponentItemCheckbox} {
          display: flex;
          align-items: baseline;
          padding: unset;
          margin: unset;
          padding-left: 5px;
          margin-left: unset;
          cursor: unset;
      
          &.selected {
            background-color: ${token.colorPrimaryBg};
            padding-bottom: 8px;
          }
      
          span {
            &:last-child {
              flex-grow: 1;
            }
          }
        }
      
        .${shaListComponentDivider} {
          &.selected {
            margin-top: 0;
          }
        }
      
        .${shaListComponentExtraSpace} {
          display: flex;
          align-content: space-between;
          flex-direction: row;
          flex-wrap: nowrap;
          justify-content: space-evenly;
          align-items: flex-start;
      
          .${shaResponsiveButtonGroupContainer} {
            line-height: unset;
            max-width: 200px;
            margin-left: 12px;
          }
      
          .${shaResponsiveButtonGroupInlineContainer} {
            button {
              padding: 4px 4px 28px 4px;
              margin-left: 6px;
      
              &:hover {
                background-color: #91d5ff;
              }
            }
          }
        }
      
        .${shaListComponentBody} {
          &.loading {
            height: 300px;
          }
      
          overflow-y: auto;
          overflow-x: hidden;
      
          &.horizontal {
            display: flex;
            overflow-x: auto;
      
            .${prefixCls}-space.${prefixCls}-space-horizontal {
              display: inline-flex;
              flex-wrap: nowrap;
            }
          }
        }
      
        .${shaListComponentAddItemBtn} {
          display: none;
          position: absolute;
          right: 5px;
          top: 5px;
        }
      
        .${shaListComponentItem} {
          position: relative;
          padding-top: 5px;
      
          &.selected {
            background-color: ${token.colorPrimaryBg};
          }
      
          &:hover {
            >.${shaListComponentAddItemBtn} {
              display: block;
            }
          }
      
          .${shaListComponentDivider} {
            margin: 12px 0;
            border-top-width: 2px;
          }
        }
      
        .${shaListPaginationContainer} {
          display: flex;
          justify-content: flex-end;
        }
    `);
    return {
        shaListComponent,
        shaResponsiveButtonGroup,
        shaListComponentItemCheckbox,
        shaListComponentDivider,
        shaListComponentExtra,
        shaListComponentExtraSpace,
        shaResponsiveButtonGroupContainer,
        shaResponsiveButtonGroupInlineContainer,
        shaListComponentBody,
        shaListComponentAddItemBtn,
        shaListComponentItem,
        shaListPaginationContainer,
        shaListComponentPanel,
    };
});