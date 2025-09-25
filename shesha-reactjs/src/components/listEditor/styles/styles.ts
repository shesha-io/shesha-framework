import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }) => {
  const dragHandle = "sha-drag-handle";
  const listContainer = "sha-list-container";
  const listHeader = "sha-list-header";
  const listInsertArea = "sha-list-insert-area";
  const listInsertPlaceholder = "sha-list-insert-placeholder";
  const listInsertRow = "sha-list-insert-row";
  const listItem = "sha-list-item";
  const listItemSelected = "sha-list-item-selected";
  const listItemContent = "sha-list-item-content";
  const listItemControls = "sha-list-item-controls";
  const listItemGhost = "sha-list-item-ghost";
  const listItemName = "sha-list-item-name";
  const helpIcon = "sha-help-icon";
  const dragIcon = "sha-drag-icon";

  const list = cx("sha-list", css`
        padding-left: 4px;
        
        .${listHeader} {
            display: flex;
            align-items: flex-end;
            justify-content: flex-end;
            margin: 5px 0;
            &:empty {
                margin: 0;
            }
        }

        .${listContainer} {
            padding-top: 7px;
            padding-bottom: 7px;
            .${listItem} {
                position: relative;
                display: flex;
                padding: 5px;
                border: 1px solid #ddd;
                border-radius: 4px;
                margin-bottom: 4px;

                &.${listItemSelected}{
                    border: ${token.colorPrimary} 1px dashed;
                    border-radius: 4px;
                    background-color: ${token.colorPrimaryBg}80;
                }

                .${listInsertPlaceholder} {
                    width: 100%;
                    height: 1px;
                    border: 2px solid ${token.colorPrimary};
                    position: absolute;
                    left: 0px;
                    z-index: 10;

                    &.before{
                        top: -5px;
                    }
                    &.after{
                        bottom: -5px;
                    }
                }

                .${listInsertArea} {
                    position: absolute;
                    height: 18px;
                    width: 30px;            
                    left: -5px;
                    z-index: 20;

                    &:first-child {
                        top: -12px;
                    }
                    &:last-child {
                        bottom: -12px;
                    }
                }
                &:not(:last-child) {
                    .${listInsertRow}:last-child {
                        display: none;
                    }
                }

            .${dragHandle} {
                transition: opacity 0.2s;
                opacity: 0;
                cursor: grab;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: flex-start;
                position: absolute;
                top: 5px;
                right: 35px;
                bottom: 5px;
                left: 5px;
            }

                .${dragIcon} {
                    transition: opacity 0.2s;
                    opacity: 1;
                    cursor: grab;
                }


                .${listItemContent} {
                    flex: 1;
                    margin-left: 30px;

                    .${listItemName} {
                        margin-left: 10px;
                        margin-right: 10px;
                    }
                    .${helpIcon} {
                        cursor: help;
                        font-size: 14px;
                        color: #aaa;
                    }
                }

                .${listItemControls} {
                    transition: opacity 0.2s;
                    opacity: 0;
                    display: flex;
                    align-items: center;
                }

                &:hover:not(:has(.${listContainer}:hover)) {
                    >.${listItemControls} {
                        opacity: 1;
                    }

                    >.${dragHandle} {
                        opacity: 0.8;
                    }
                }
            }
        }
    `);

  return {
    list,
    dragHandle,
    listContainer,
    listHeader,
    listInsertArea,
    listInsertPlaceholder,
    listInsertRow,
    listItem,
    listItemSelected,
    listItemContent,
    listItemControls,
    listItemGhost,
    listItemName,
    helpIcon,
    dragIcon,
  };
});
