import { createStyles, sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token, prefixCls, iconPrefixCls }) => {
  const csHeader = "sha-cs-header";
  const csHeaderLeft = "sha-cs-header-left";
  const csHeaderCenter = "sha-cs-header-center";
  const csHeaderRight = "sha-cs-header-right";
  const csContent = "sha-cs-content";
  const csLogo = "sha-cs-logo";
  const csTreeArea = "sha-cs-tree-area";
  const csWorkArea = "sha-cs-work-area";
  const csNavPanelSpinner = "sha-cs-tree-spinner";
  const csNavPanelContent = "sha-cs-nav-content";
  const csNavPanelHeader = 'sha-cs-nav-content-hd';
  const csNavPanelTree = 'sha-cs-nav-content-tree';
  const csQuickInfoIcons = 'sha-cs-quick-info-icons';
  const csDocTabs = 'sha-cs-doc-tabs';
  const csDocEditor = 'sha-cs-doc-editor';
  const csWorkAreaEmpty = 'sha-cs-work-area-empty';

  const headerHeight = 60;

  const configStudio = cx("sha-config-studio", css`

        .${csHeader} {
            height: ${headerHeight}px;
            padding: 0;
            background: ${token.colorBgContainer};
            display: flex;
            justify-content: space-between;
            align-items: center;
            .${csLogo}{
                margin: 0 5px;
            }
            >div{
                display: flex;
                align-items: center;
            }
            .${csHeaderLeft}{
            }
            .${csHeaderCenter}{
                .${csQuickInfoIcons}{
                    >.${iconPrefixCls} {
                        margin-left: 5px;
                    }
                }
            }
            .${csHeaderRight}{
                margin-right: 10px;
            }            
        }
        .${csContent}{
            height: calc(100vh - ${headerHeight}px);
            background-color: ${token.colorBgContainer};
        }
        .${csTreeArea}{
            height: calc(100vh - ${headerHeight}px);
            overflow: hidden;
            background: ${token.colorBgContainer};
            border-right: 1px solid ${token.colorBorderSecondary};
            .${csNavPanelSpinner}{
                height: 100%;
                >.${prefixCls}-spin-container {
                    height: 100%;
                }
            }
            .${csNavPanelContent}{
                display: flex;
                flex-direction: column;
                height: 100%;
                .${csNavPanelHeader}{
                    margin-bottom: 8px;
                    flex-grow: 0;
                }
                .${csNavPanelTree}{
                    flex-grow: 1;
                    overflow: auto;
                    ${sheshaStyles.thinScrollbars}
                    >.${prefixCls}-tree{
                        height:100%;
                    }
                    .${prefixCls}-tree-treenode {
                      width: 100%;
                      max-width: 100%;
                      .${prefixCls}-tree-draggable-icon {
                        display: none;
                      }
                      /* Empty-folder placeholder (filter.ts): shown as a muted hint, not hidden - display:none broke rc-virtual-list's scroll bookkeeping. */
                      &.sha-cs-tree-empty-placeholder {
                        cursor: default;
                        .${prefixCls}-tree-node-content-wrapper {
                          color: ${token.colorTextDisabled};
                          font-style: italic;
                          cursor: default;
                          &:hover {
                            background: transparent;
                          }
                        }
                        .${prefixCls}-tree-switcher,
                        .${prefixCls}-tree-iconEle {
                          visibility: hidden;
                        }
                      }
                      /* Keep long labels on a single line, clipped at the panel
                         edge instead of wrapping (File Explorer behaviour).
                         The content wrapper becomes a flex row so the type icon
                         stays inline and only the title truncates; min-width: 0
                         lets the title shrink below its content width so the
                         ellipsis actually triggers. */
                      .${prefixCls}-tree-node-content-wrapper {
                        display: flex;
                        align-items: center;
                        min-width: 0;
                        overflow: hidden;
                        .${prefixCls}-tree-iconEle {
                          flex: none;
                        }
                        .${prefixCls}-tree-title {
                          flex: 1 1 auto;
                          min-width: 0;
                          overflow: hidden;
                          white-space: nowrap;
                          text-overflow: ellipsis;
                        }
                      }
                    }
                }
            }
        }
        .${csWorkArea}{
            height: calc(100vh - ${headerHeight}px);
            overflow: auto;
            flex-grow: 1 !important;
            .${csDocTabs}{
                height: 100%;
                >.ant-tabs-content-holder{
                    height: 100%;
                    ${sheshaStyles.thinScrollbars}
                    >.ant-tabs-content{
                        height: 100%;
                        overflow: hidden;
                        >.ant-tabs-tabpane {
                            height: 100%;
                        }
                    }
                }
            }
        }
        .${csDocEditor}{
            padding: 0;
            height: 100%;
        }
        .${csWorkAreaEmpty}{
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
  `);

  return {
    csLogo,
    configStudio,
    csHeader,
    csHeaderLeft,
    csHeaderCenter,
    csHeaderRight,
    csContent,
    csTreeArea,
    csWorkArea,
    csNavPanelSpinner,
    csNavPanelContent,
    csNavPanelHeader,
    csNavPanelTree,
    csQuickInfoIcons,
    csDocTabs,
    csDocEditor,
    csWorkAreaEmpty,
  };
});
