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
  const csNavPanelTitle = 'sha-cs-nav-content-title';
  const csNavPanelTitleText = 'sha-cs-nav-content-title-text';
  const csNavPanelToggle = 'sha-cs-nav-content-toggle';
  const csNavPanelHeader = 'sha-cs-nav-content-hd';
  const csNavPanelTree = 'sha-cs-nav-content-tree';
  const csQuickInfoIcons = 'sha-cs-quick-info-icons';
  const csDocTabs = 'sha-cs-doc-tabs';
  const csDocEditor = 'sha-cs-doc-editor';

  const headerHeight = 60;
  const tabCardHeight = 40;

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
                padding-right: ${sheshaStyles.paddingMD}px;
                .${csNavPanelTitle}{
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 35px;
                    flex-grow: 0;
                    padding: 0 ${sheshaStyles.paddingLG}px;
                    font-weight: 500;
                    font-size: 14px;
                    border-bottom: 1px solid ${token.colorBorderSecondary};
                    .${csNavPanelTitleText}{
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .${csNavPanelToggle}{
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 24px;
                        width: 24px;
                        margin-left: auto;
                        cursor: pointer;
                        border-radius: ${token.borderRadius}px;
                        color: ${token.colorTextSecondary};
                    }
                }
                &.collapsed{
                    padding-right: 0;
                    .${csNavPanelTitle}{
                        padding: 0;
                        justify-content: center;
                    }
                    .${csNavPanelToggle}{
                        margin-left: 0;
                    }
                }
                .${csNavPanelHeader}{
                    margin-bottom: 8px;
                    flex-grow: 0;
                    padding: ${sheshaStyles.paddingLG}px ${sheshaStyles.paddingLG}px 0;
                }
                .${csNavPanelTree}{
                    flex-grow: 1;
                    overflow: auto;
                    padding: 0 ${sheshaStyles.paddingLG}px ${sheshaStyles.paddingLG}px;
                    ${sheshaStyles.thinScrollbars}
                    >.${prefixCls}-tree{
                        height:100%;
                    }
                    .${prefixCls}-tree-treenode {
                      .${prefixCls}-tree-draggable-icon {
                        display: none;
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
                    }
                }
            }
        }
        .${csDocEditor}{
            padding: 0;
            overflow: auto;
            height: calc(100vh - ${headerHeight}px - ${tabCardHeight}px);
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
    csNavPanelTitle,
    csNavPanelTitleText,
    csNavPanelToggle,
    csNavPanelHeader,
    csNavPanelTree,
    csQuickInfoIcons,
    csDocTabs,
    csDocEditor,
  };
});
