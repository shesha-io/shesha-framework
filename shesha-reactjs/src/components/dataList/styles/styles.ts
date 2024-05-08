import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx, token, prefixCls }) => {
    const shaDatalistComponentItemCheckbox = "sha-datalist-component-item-checkbox";
    const shaDatalistComponentDivider = "sha-datalist-component-divider";
    const shaDatalistComponentExtraSpace = "sha-datalist-component-extra-space";
    const shaResponsiveButtonGroupContainer = "sha-responsive-button-group-container";
    const shaResponsiveButtonGroupInlineContainer = "sha-responsive-button-group-inline-container";
    const shaDatalistComponentBody = "sha-datalist-component-body";
    const shaDatalistComponentAddItemBtn = "sha-datalist-component-add-item-btn";
    const shaDatalistComponentItem = "sha-datalist-component-item";
    const shaDatalistWrapParent = "sha-datalist-wrap-parent";
    const shaDatalistCard = "sha-datalist-card";
    const shaDatalistActions = "sha-datalist-actions";
    const shaDatalistCell = "sha-datalist-cell";


    const shaDatalistComponent = cx("sha-datalist-component", css`
        .${prefixCls}-collapse-extra {
            margin: unset !important;
        }
    
        .${shaDatalistComponentItemCheckbox} {
            display: flex;
            align-items: baseline;
            padding: unset;
            margin: unset;
            padding-left: 5px;
            margin-left: unset;
            cursor: unset;
    
            &.selected {
                background-color: ${token.colorPrimaryBgHover};
                padding-bottom: 8px;
            }
    
            span {
                &:last-child {
                    flex-grow: 1;
                }
            }
        }
    
        .${shaDatalistComponentDivider} {
            &.selected {
                margin-top: 0;
            }
        }
    
        .${shaDatalistComponentExtraSpace} {
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

    
        .${shaDatalistComponentBody} {
            overflow-y: auto;
            overflow-x: hidden;
    
            &.loading {
                height: 300px;
            }
    
            &.horizontal {
                display: flex;
                overflow-x: auto;
    
                .${prefixCls}-space {
                    &.${prefixCls}-space-horizontal {
                        display: inline-flex;
                        flex-wrap: nowrap;
                    }
                }
            }

            .${shaDatalistComponentDivider} {
                margin: 8px 0 0 0;
            }
        }
    
        .${shaDatalistComponentAddItemBtn} {
            display: none;
            position: absolute;
            right: 5px;
            top: 5px;
        }
    
        .${shaDatalistActions} {
            display: none;
            position: absolute;
            top: 5px;
            left: 5px;
        }

        .${shaDatalistWrapParent} {
            width: 100%;
            display: grid;
            gap: 20px;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            overflow: auto;
            place-items: center;
            padding: 8px;
        }

        .${shaDatalistCard} {
            padding: 10px;
            background-color: #ffffff;
            border-radius: 5px;
            position: relative;
            overflow: auto;         
        }

        .${shaDatalistComponentItem} {
            position: relative;
            padding-top: 5px;
    
            &.selected {
                background-color: ${token.colorPrimaryBgHover};
            }
    
            &:hover {
                &>.${shaDatalistComponentAddItemBtn} {
                    display: block;
                }
            }
        }

        .${shaDatalistCell}:hover {
            &>.${shaDatalistActions} {
                display: block;
            }
        }
    `);
    return {
        shaDatalistComponent,
        shaDatalistComponentItemCheckbox,
        shaDatalistComponentDivider,
        shaDatalistComponentExtraSpace,
        shaResponsiveButtonGroupContainer,
        shaResponsiveButtonGroupInlineContainer,
        shaDatalistComponentBody,
        shaDatalistComponentAddItemBtn,
        shaDatalistComponentItem,
        shaDatalistActions,
        shaDatalistCell,
        shaDatalistWrapParent,
        shaDatalistCard
    };
});