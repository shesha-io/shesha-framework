import { createStyles } from "@/styles";

export const useStyles = createStyles(({ css, cx, token }) => {
    const shaActionButtons = "sha-action-buttons";
    const sidebarContainerMainArea = "sidebar-container-main-area";
    const shaToolbarConfiguratorAlert = "sha-toolbar-configurator-alert";
    const shaToolbarConfiguratorBodyTabs = "sha-toolbar-configurator-body-tabs";
    const shaToolbarItemDragHandle = "sha-toolbar-item-drag-handle";
    const shaToolbarItem = "sha-toolbar-item";
    const shaToolbarItemControls = "sha-toolbar-item-controls";
    const shaToolbarItemHeader = "sha-toolbar-item-header";
    const shaToolbarGroupHeader = "sha-toolbar-group-header";
    const shaToolbarGroupContainer = "sha-toolbar-group-container";
    const shaToolbarItemGhost = "sha-toolbar-item-ghost";
    const shaTooltipIcon = "sha-tooltip-icon";
    const shaToolbarItemName = "sha-toolbar-item-name";
    const shaHelpIcon = "sha-help-icon";

   const  shaToolbarConfigurator = cx("sha-toolbar-configurator", css`
    .${shaActionButtons} {
        margin: 8px 0;
        .ant-btn {
            margin-right: 8px;
        }
    }
    .${sidebarContainerMainArea} {
        background-color: white !important;

        .${shaToolbarConfiguratorAlert} {
            margin: 0 8px;
        }
        .${shaToolbarConfiguratorBodyTabs} {
            padding: 0 8px;
          }

        .${shaToolbarItem} {
            position: relative;
            height: auto;
            width: 100%;
            border: 1px solid #ddd;
            border-radius: 2px;
            margin-bottom: 4px;
            box-sizing: border-box;

            .${shaToolbarItemName} {
                display: flex;
                gap: 5px;
                margin-left: 10px;
                margin-right: 10px;
            }
    
            .${shaHelpIcon} {
                cursor: help;
                font-size: 14px;
                color: #aaa;
            }

            &.selected {
                border: ${token.colorPrimary} 1px dashed;
                border-radius: 4px;
                background-color: ${token.colorPrimaryBg}80;
            }

            .${shaToolbarItemDragHandle} {
                border-radius: 2px;
                background-color: #ddd;
                width: 14px;
                height: 100%;
                display: inline-block;
                cursor: grab;
                margin-right: 5px;
            }

            .${shaToolbarItemControls} {
                text-align: right;
                position: absolute;
                right: 5px;
                top: 5px;
                display: block;
                min-height: 20px;
                z-index: 1000;
            }
            &:not(:hover) {
                .${shaToolbarItemControls} {
                    display: none;
                }
            }

            .${shaToolbarItemHeader} {
                padding: 5px;
            }

            .${shaToolbarGroupHeader} {
                padding: 5px;
                border-bottom: 1px solid #ddd;
            }

            .${shaToolbarGroupContainer} {
                min-height: 30px;
                padding: 5px 5px 0px 20px;
            }
        }

        .${shaToolbarItemGhost} {
            border: 1px dashed ${token.colorPrimary};
            border-radius: 2px;
            opacity: 0.7;
        }
    }

    .${shaTooltipIcon} {
        color: darkgray !important;
        margin-left: 5px;
        margin-right: 5px;
    }
`);

   return {
        shaToolbarConfigurator,
        shaActionButtons,
        sidebarContainerMainArea,
        shaToolbarConfiguratorAlert,
        shaToolbarConfiguratorBodyTabs,
        shaToolbarItemDragHandle,
        shaToolbarItem,
        shaToolbarItemControls,
        shaToolbarItemHeader,
        shaToolbarGroupHeader,
        shaToolbarGroupContainer,
        shaToolbarItemGhost,
        shaTooltipIcon,
        shaToolbarItemName,
        shaHelpIcon,
   };
});