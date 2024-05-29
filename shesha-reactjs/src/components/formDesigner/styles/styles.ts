import { createStyles } from "antd-style";
import { sheshaStyles } from '@/styles';

export const useStyles = () => {
    const shaForm = "sha-form";
    const shaHelpIcon = "sha-help-icon";
    const shaDragging = "sha-dragging";
    const componentDragHandle = "sha-component-drag-handle";

    const sidebarContainerMainAreaBody = "sidebar-container-main-area-body";
    const shaDesignerToolbar = "sha-designer-toolbar";
    const shaToolboxComponents = "sha-toolbox-components";
    const shaDesignerToolbarLeft = "sha-designer-toolbar-left";
    const shaDesignerToolbarRight = "sha-designer-toolbar-right";
    const shaDesignerCanvasConfig = "sha-designer-canvas-config";

    const shaDesignerToolbox = "sha-designer-toolbox";
    const shaDatasourceTree = "sha-datasource-tree";
    const shaToolboxComponent = "sha-toolbox-component";
    const shaToolboxPanelComponents = "sha-toolbox-panel-components";
    const shaComponentTitle = "sha-component-title";
    const shaComponentSearch = "sha-component-search";
    const shaToolboxPanel = "sha-toolbox-panel";

    const sidebarHeaderTitle = "sidebar-header-title";
    const shaDesignerHeader = "sha-designer-header";
    const componentPropertiesActions = "component-properties-actions";

    const shaComponentGhost = "sha-component-ghost";
    const shaComponent = "sha-component";
    const shaComponentsContainer = "sha-components-container";
    const shaComponentsContainerInner = "sha-components-container-inner";
    const shaDropHint = "sha-drop-hint";

    const shaComponentIndicator = "sha-component-indicator";
    const shaComponentControls = "sha-component-controls";
    const designerWorkArea = "sha-designer-work-area";

    const siteTreeSearchValue = "site-tree-search-value";
    const shaDesignerWarning = "sha-designer-warning";
    const hasConfigErrors = "has-config-errors";
    const shaComponentValidationIcon = "sha-component-validation-icon";
    const shaDesignerHeaderRight = "sha-designer-header-right";

    const mainArea = "sha-designer-main-area";

    return {
        styles: {
            shaHelpIcon,
            shaDragging,
            componentDragHandle,
            sidebarContainerMainAreaBody,
            shaDesignerToolbar,
            shaToolboxComponents,
            shaDesignerToolbarLeft,
            shaDesignerToolbarRight,
            shaDesignerCanvasConfig,
            shaDesignerToolbox,
            sidebarHeaderTitle,
            shaDesignerHeader,
            shaComponentGhost,
            shaComponent,
            shaToolboxComponent,
            shaToolboxPanelComponents,
            shaComponentTitle,
            shaComponentSearch,
            shaToolboxPanel,
            shaDatasourceTree,
            shaComponentIndicator,
            shaComponentsContainer,
            shaComponentsContainerInner,
            shaDropHint,
            designerWorkArea,
            componentPropertiesActions,
            shaComponentControls,
            siteTreeSearchValue,
            shaDesignerWarning,
            hasConfigErrors,
            shaComponentValidationIcon,
            shaDesignerHeaderRight,
            shaForm,
            mainArea,
        }
    };
};

export const useMainStyles = createStyles(({ css, cx, token, prefixCls, iconPrefixCls }) => {
    const {
        shaHelpIcon,
        shaDragging,
        componentDragHandle,
        sidebarContainerMainAreaBody,
        shaDesignerToolbar,
        shaToolboxComponents,
        shaDesignerToolbarLeft,
        shaDesignerToolbarRight,
        shaDesignerCanvasConfig,
        shaDesignerToolbox,
        sidebarHeaderTitle,
        shaDesignerHeader,
        shaComponentGhost,
        shaComponent,
        shaToolboxComponent,
        shaToolboxPanelComponents,
        shaComponentTitle,
        shaComponentSearch,
        shaToolboxPanel,
        shaDatasourceTree,
        shaComponentIndicator,
        shaComponentsContainer,
        shaDropHint,
        designerWorkArea,
        componentPropertiesActions,
        shaComponentControls,
        siteTreeSearchValue,
        shaDesignerWarning,
        hasConfigErrors,
        shaComponentValidationIcon,
        shaDesignerHeaderRight,
        shaForm,
        //mainArea,
    } = useStyles().styles;

    const quickEditModal = cx("sha-designer-modal", css`
        .${prefixCls}-modal-content {
            padding: 0;
            .${prefixCls}-modal-header {
                padding: 16px 24px;
                margin: 0;
                border-bottom: ${sheshaStyles.border};
            }
        }
    `);

    const formDesignerClassName = "sha-form-designer";
    const designerPage = "sha-designer-page";
    /*
    const flexColumns = `
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: stretch;
        align-content: flex-start;
    `;
    const flexFitHorizontal = 'flex-grow: 1;';
    const designerPage = cx("sha-designer-page", css`
        ${flexColumns}
        
        .${formDesignerClassName} {
            ${flexFitHorizontal}
            ${flexColumns}

            .${mainArea} {
                ${flexFitHorizontal}
                .sidebar-container {
                    height: 100%;
                }
            }
        }
   `);
    */
    const formDesigner = cx(formDesignerClassName, css`
        .${shaHelpIcon} {
            cursor: help;
            font-size: 14px;
            color: #aaa;
        }
        &.${shaDragging} {
            .${shaForm} {
                .${componentDragHandle} {
                    visibility: hidden;
                }
            }
        }
        .${componentDragHandle} {
            top: 0px;
            left: 0px;
        }
        .${sidebarContainerMainAreaBody} {
            .content-heading {
                .${shaDesignerHeader} {
                  background: white;
                  margin: unset;
                  border-top: 1px solid lightgrey;
                  padding: ${sheshaStyles.paddingMD}px;
                }
            }
        }
        .${shaToolboxComponents}{
            height: 100%;
            overflow-y: auto; 
            overflow-x: hidden; 
            margin-bottom: 1rem;
        }
        .${shaDesignerToolbar} {
            background: white;
            padding: 12px;
            display: flex;
            justify-content: space-between;
        
            .${shaDesignerToolbarLeft} {
                float: left;
        
                .${prefixCls}-btn {
                margin-right: 2px;
                }
            }
        
            .${shaDesignerToolbarRight} {
                float: right;
                .${prefixCls}-btn {
                margin-left: 2px;
                }
            }
            .${shaDesignerCanvasConfig} {
                display: flex;
                justify-content: space-between;
                gap: 1.5rem;
                margin: 0 20%;
                padding-left:5%;
                .radio-button {
                    width: 33%;
                  }
;            }
        }
        .${shaDesignerToolbox} {
            height: 85vh;
            margin-bottom: 3rem;
            .${shaDatasourceTree} {
                .${prefixCls}-tree-switcher-noop {
                    display: none;
                }
        
                .${shaToolboxComponent} {
                    margin: 0;
                    display: block;
                    white-space: nowrap;
                    overflow: hidden;
                    max-width: 225px;
                    text-overflow: ellipsis;

                    .${shaComponentTitle} {
                        margin-right: 10px;
                    }
                 
                }
        
                .${siteTreeSearchValue} {
                    background-color: chartreuse;
                    color: #f50;
                }
            }
        
            .${prefixCls}-collapse-item {
                .${prefixCls}-collapse-header {
                    padding: 4px 8px;
        
                    &:hover {
                        color: ${token.colorPrimary};
                        background-color: ${token.colorPrimaryBgHover};
                    }
                }
            }
        
            .${shaComponentSearch} {
                margin-bottom: 4px;
            }
        
            .${shaToolboxPanel} {
                .${prefixCls}-collapse-header-text {
                    white-space: nowrap;
                    overflow: hidden;
                    width: 300px;
                    text-overflow: ellipsis;
                }
        
                &.active {
                    background-color: #ebf3fb;
                }
            }
        
            .${shaToolboxComponent} {
                display: flex;
                user-select: none;
                padding: 2px;
                align-items: flex-start;
                align-content: flex-start;
                line-height: 1.5;
                border-radius: 3px;
                background: #fff;
                margin: 4px 0;
                border: 1px solid #ddd;
        
                .${iconPrefixCls} {
                    margin: 5px 10px 5px 10px;
                }
        
                &:hover {
                    border-radius: 5px;
                    color: ${token.colorPrimary};
                    background-color: ${token.colorPrimaryBgHover};
                    cursor: grab;
                }
            }
        }
        .${sidebarHeaderTitle} {
            .${componentPropertiesActions} {
                width: 100%;
        
                .action-buttons {
                float: right;
        
                .${prefixCls}-btn {
                    margin-left: 2px;
                }
        
                .${prefixCls}-btn-dangerous {
                    margin-left: 10px;
                }
                }
            }
        }
        .${shaDesignerHeader} {
            display: flex;
            justify-content: space-between;
        
            .${shaDesignerHeaderRight} {
                .ant-btn-link {
                    &:hover {
                        border-radius: 5px;
                        color: ${token.colorPrimary};
                        background-color: ${token.colorPrimaryBgHover};
                    }
                }
            }
        }
        
        .${designerWorkArea}{
            background-color: white;
            .${shaComponentsContainer} {
                border-radius: 2px;
            
                .${shaDropHint} {
                    margin: 0;
                    text-align: center;
                    color: darkgray;
                    padding: 10px;
                }
            
                .${shaComponent} {
                    min-height: 30px;
                }
            }
        }

        .${shaComponentGhost} {
            border: 1px dashed #4099ff;
            border-radius: 2px;
            opacity: 0.7;

          

        }
        .${shaToolboxPanelComponents}{
            margin: -1rem -0.8rem;
        }
        .${shaComponent} {
            position: relative;
            margin: 4px;
            margin-left: 10px;
        
            .${prefixCls}-alert.${shaDesignerWarning} {
              margin-bottom: 0;
            }
        
            &.selected {
              border: #61affe 1px solid;
              border-radius: 4px;
              background-color: #ebf3fb;
            }
        
            &.${hasConfigErrors} {
              border: ${token.colorErrorBg} 1px solid;
              border-radius: 4px;
        
              .${shaComponentIndicator} {
                display: none;
              }
        
              .${shaComponentValidationIcon} {
                display: inline-flex;
                align-items: center;
                color: ${token.colorErrorBg};
                font-size: 12px !important;
                left: 15px;
                height: 100%;
                position: absolute;
                z-index: 1000;
              }
            }
        
            .${componentDragHandle} {
              visibility: visible;
              border-radius: 2px;
              width: 100%;
              height: 100%;
              position: relative;
              cursor: grab;
              border: 1px dashed #61affe;
              box-sizing: border-box;
            }
            &:not(:hover) {
                .${shaComponentControls} {
                    display: none;
                }
            
                .${componentDragHandle} {
                    border: 1px solid white;
                }
            }
        
            .${shaComponentIndicator} {
              display: inline-block;
              align-items: center;
              color: darkgray;
              left: 15px;
              height: 100%;
              position: absolute;
              z-index: 1000;
        
              .anticon {
                margin-right: ${sheshaStyles.paddingMD}px;
              }
            }
        
            .${shaComponentControls} {
              text-align: right;
              position: absolute;
              right: 5px;
              top: 5px;
              display: block;
              min-height: 20px;
              z-index: 1000;
            }
        
            &:not(:hover) {
              .${shaComponentControls} {
                display: none;
              }
        
              .${componentDragHandle} {
                background-color: transparent;
              }
            }
          }
    `);

    return {
        designerPage,
        formDesigner,
        quickEditModal,
    };
});