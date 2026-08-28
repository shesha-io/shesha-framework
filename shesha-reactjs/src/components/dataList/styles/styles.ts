import { createStyles } from '@/styles';

/**
 * Largest share of a card's width a label may take, so the value beside it always keeps room.
 *
 * A label sizes to its own text but stops here; anything longer wraps onto a second line *within* that share
 * (the card's form sets `labelWrap`, so it wraps rather than being clipped) while its value stays to the
 * right. At 60% a ~200px card gives the label ~115px — enough for a two-word label at the bold 14px the
 * layout applies — and leaves ~75px for the value.
 */
const MAX_LABEL_SHARE = '60%';

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
  const shaDatalistHorizontal = "sha-datalist-horizontal";


  const shaDatalistComponent = cx("sha-datalist-component", css`
        .${prefixCls}-collapse-extra {
            margin: unset !important;
        }

        .ant-divider-horizontal{
            min-width: unset !important;
        }

        .ant-alert {
            margin: 5px !important;
        }
    
        .${shaDatalistComponentItemCheckbox} {
            display: flex;
            /* Centre the selection control on its item, not on a baseline. Baseline alignment tied
               the control to the first text baseline *inside* the rendered child form, so its
               position depended entirely on whatever that form happened to start with - measured
               anywhere from 4px to past the bottom of the item across three forms. */
            align-items: center;
            padding: unset;
            margin: unset;
            padding-left: 5px;
            margin-left: unset;
            cursor: unset;

            /* antd's own 'align-self: center' on the box would otherwise override the line above,
               and it centres over the flex line rather than the item. Restating it here keeps the
               two shapes (control as a sibling of the item, and antd's own wrapper) consistent.
               The row gap lives on the row wrapper, so the line is exactly the item's border box
               and centring lands on the card itself. */
            > .${prefixCls}-checkbox,
            > .${prefixCls}-radio {
                align-self: center;
            }

            &.selected {
                background-color: ${token.colorPrimaryBgHover};
                padding-bottom: 8px;
            }
    
            span {
                &:last-child {
                    flex-grow: 1;
                }
            }

            /* The row content is a sibling of the selection control now, not a child of its <label>,
               so it is a div rather than antd's trailing <span> - make it take the remaining width. */
            > .${shaDatalistComponentItem},
            > .${shaDatalistCard} {
                flex-grow: 1;
                min-width: 0;
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

            /*
             * Cards in 'wrap'/'horizontal' orientation are only as wide as the configured item width, so a
             * proportional labelCol ({ span: 6 } by default) collapses to a fraction of the label's width and
             * antd clips it - .ant-form-item-label is 'overflow: hidden'. Size each label to its own text
             * instead and give the value the space to its right.
             *
             * 'flex-wrap: nowrap' is the important part. .ant-row is 'flex-flow: row wrap', and flex line
             * breaking compares items' hypothetical sizes *before* shrinking, so the value drops onto its own
             * line as soon as label + value content exceeds the card - no amount of flex-shrink prevents it.
             * Keeping the row on one line means both shrink to fit instead, and the value stays beside its
             * label at every card width.
             *
             * Scoped to '-horizontal' items so components configured for a vertical layout keep theirs.
             */
            &.wrap,
            &.horizontal {
                .${prefixCls}-form-item-horizontal > .${prefixCls}-form-item-row {
                    flex-wrap: nowrap;

                    > .${prefixCls}-form-item-label {
                        flex: 0 1 auto;
                        max-width: ${MAX_LABEL_SHARE};
                    }

                    > .${prefixCls}-form-item-control {
                        flex: 1 1 auto;
                        min-width: 0;
                        max-width: 100%;
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
            overflow-wrap: break-word;
        }

        .${shaDatalistCard} {
            border-radius: 8px;
            position: relative;
            max-width: 100%;
            overflow: auto;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
            transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
            cursor: pointer;

            &:hover {
                box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 2px 8px -1px rgba(0, 0, 0, 0.05);
                transform: translateY(-2px);
            }
        }

        .${shaDatalistCard} > *,
        .${shaDatalistComponentItem} > * {
            width: 100% !important;
            max-width: 100%;
            overflow-wrap: break-word;
        }

        .${shaDatalistCard} .sha-components-container,
        .${shaDatalistCard} .sha-components-container-inner,
        .${shaDatalistComponentItem} .sha-components-container,
        .${shaDatalistComponentItem} .sha-components-container-inner {
            width: 100% !important;
        }

        .${shaDatalistHorizontal} {
            display: flex;
            flex-direction: row;
            width: 100%;
            overflow-x: scroll;
        }

        .${shaDatalistHorizontal} {
            display: flex;
            flex-direction: row;
            width: 100%;
            overflow-x: scroll;
        }

        .${shaDatalistComponentItem} {
            position: relative;
            border-radius: 6px;
            transition: background-color 0.2s ease-in-out;

            &.selected {
                background-color: ${token.colorPrimaryBgHover};
            }

            &:hover {
                background-color: ${token.colorFillTertiary};

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
    shaDatalistCard,
    shaDatalistHorizontal,
  };
});
