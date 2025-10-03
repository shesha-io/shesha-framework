import { getFormDesignerBackgroundSvg } from '@/components/sidebarContainer/styles/svg/dropHint';
import { createStyles, sheshaStyles } from '@/styles';

const designerClassNames = {
  componentDragHandle: "sha-component-drag-handle",
  componentPropertiesActions: "component-properties-actions",
  designerWorkArea: "sha-designer-work-area",
  hasConfigErrors: "has-config-errors",
  mainArea: "sha-designer-main-area",
  previewBorderTop10: "preview-form-border-top-10",
  shaComponent: "sha-component",
  shaComponentControls: "sha-component-controls",
  shaComponentGhost: "sha-component-ghost",
  shaComponentIndicator: "sha-component-indicator",
  shaComponentSearch: "sha-component-search",
  shaComponentTitle: "sha-component-title",
  shaComponentValidationIcon: "sha-component-validation-icon",
  shaComponentsContainer: "sha-components-container",
  shaComponentsContainerInner: "sha-components-container-inner",
  shaDatasourceTree: "sha-datasource-tree",
  shaDesignerCanvasConfig: "sha-designer-canvas-config",
  shaDesignerHeader: "sha-designer-header",
  shaDesignerHeaderRight: "sha-designer-header-right",
  shaDesignerToolbar: "sha-designer-toolbar",
  shaToolboxComponents: "sha-toolbox-components",
  shaDesignerToolbarLeft: "sha-designer-toolbar-left",
  shaDesignerToolbarRight: "sha-designer-toolbar-right",
  shaDesignerToolbarCenter: "sha-designer-toolbar-center",
  shaDesignerToolbox: "sha-designer-toolbox",
  shaDesignerWarning: "sha-designer-warning",
  shaDragging: "sha-dragging",
  shaDropHint: "sha-drop-hint",
  shaForm: "sha-form",
  shaHelpIcon: "sha-help-icon",
  shaToolboxComponent: "sha-toolbox-component",
  shaToolboxPanelComponents: "sha-toolbox-panel-components",
  shaToolboxPanel: "sha-toolbox-panel",
  shaToolboxPanelItems: "sha-toolbox-panel-items",
  sidebarContainerMainAreaBody: "sidebar-container-main-area-body",
  sidebarHeaderTitle: "sidebar-header-title",
  siteTreeSearchValue: "site-tree-search-value",
  formName: "form-name",
  formTitle: "form-title",
  formNameParent: "form-name-parent",
  toolbarWrapper: "form-toolbar-wrapper",
};
const useStylesResponse = {
  styles: designerClassNames,
};
export const useStyles = () => {
  return useStylesResponse;
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
    shaDesignerToolbarCenter,
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
    shaToolboxPanelItems,
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
    formName,
    formTitle,
    formNameParent,
    // mainArea,
  } = useStyles().styles;

  const quickEditModal = cx("sha-designer-modal", css`
        .${prefixCls}-modal {
            overflow-y: hidden;
        }
        .${prefixCls}-modal-content {
            padding: 0;
            margin-top: -84px;
            overflow-y: hidden;
            height: calc(100vh - 40px);
            scrollbar-width: none;
            .${prefixCls}-modal-header {
                padding: 8px 12px;
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
            padding: 8px 12px 0px 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .${formName} {
                margin-left: -95px;
                margin-top: 13px;
                overflow: visible;
                display: flex;
                flex-direction: row;
                cursor: pointer;
                user-select: none;
                transition: 0.2s;
            }
            .${formTitle} {
                margin: 0;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                font-weight: 600;
                margin-left: 100px;
                max-width: 150px;
            }

            .${formNameParent} {
                display: flex;
                align-items: center;
                justify-content: flex-start;
                margin-top: -10px;
            }

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
                    border-radius: 4px;
                }
            }

            .${shaDesignerToolbarCenter} {
                width: 180px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .${shaDesignerCanvasConfig} {
                display: flex;
                justify-content: space-between;
                gap: 1.5rem;
                margin: 0;
                padding-left:5%;
                .radio-group {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    .radio-button {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 25%;
                    }
                }
        
            }
        }
        .${shaDesignerToolbox} {
            height: 85vh;
            margin-bottom: 3rem;
            .${shaDatasourceTree} {
                .${prefixCls}-tree-switcher-noop {
                    display: none;
                }

                .ant-tree-list {
                  padding: 0;
                }

                .${shaToolboxComponent} {
                    margin: 0;
                    display: flex;
                    white-space: normal;
                    overflow: hidden;
                    max-width: 100%;
                    overflow: auto;
        
                    .${shaComponentTitle} {
                        margin-right: 10px;
                    }
                }
        
                .${siteTreeSearchValue} {
                    background-color: chartreuse;
                    color: #f50;
                }
            }
            
            .ant-tabs-tab, .ant-tabs-nav-operations {
                height: 30px;
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
                    background-color: ${token.colorPrimaryBg}80;
                }
                .${shaToolboxPanelItems} {
                    margin:-1rem -0.8rem;
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
            height: 100%;
            .${shaComponentsContainer} {
                border-radius: 2px;

                .${shaDropHint} {
                    margin: 0;
                    text-align: center;
                    color: darkgray;
                    padding: 10px;
                    height: 55px;
                }

                .${shaComponent} {
                    min-height: 30px;
                }

                /* Improve dropzone visibility during drag operations */
                &.sha-components-container-inner {
                    min-height: 20px;
                    transition: background-color 0.2s ease, border 0.2s ease;

                    &:empty {
                        min-height: 40px;
                        border: 2px dashed transparent;
                        border-radius: 4px;
                    }
                }
            }

            /* Enhanced visual feedback when dragging */
            &.${shaDragging} {
                .${shaComponentsContainer} {
                    &.sha-components-container-inner:empty {
                        border-color: ${token.colorPrimary}40;
                        background-color: ${token.colorPrimaryBg}20;
                    }

                    &.sha-components-container-inner:hover {
                        border-color: ${token.colorPrimary};
                        background-color: ${token.colorPrimaryBg}40;
                    }
                }
            }

            > div {
             height: 100%;
             .sha-drop-hint {
                display: none;
             }
                > div:not(.sha-drop-hint) {
                    min-height: 100vh;
                    height: 100%;
                }
                    
                > .sha-components-container-inner:not(:has(.sha-component)) {
                    background: url("${getFormDesignerBackgroundSvg()}");
                    background-size: 25vw;
                    background-repeat: no-repeat;
                    background-position: 50% 50%;
                }
            }
        }

        .${shaComponentGhost} {
            border: 1px dashed ${token.colorPrimary};
            border-radius: 2px;
            opacity: 0.7;        
        }
        .${shaToolboxPanelComponents}{
            margin: -1rem -0.8rem;
        }
        .${shaComponent} {
            position: relative;
        
            .${prefixCls}-alert.${shaDesignerWarning} {
              margin-bottom: 0;
            }
        
            &.selected {
              border: ${token.colorPrimary} 1px solid;
              border-radius: 4px;
              background-color: ${token.colorPrimaryBg}80;
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
              border: 1px dashed ${token.colorPrimary};
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
