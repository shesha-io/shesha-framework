import { createStyles } from '@/styles';

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
            background-color: ${token.colorBgContainer};
        }
        .${csTreeArea}{
            height: calc(100vh - ${headerHeight}px);
            overflow: 'auto';
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
            overflow: 'auto';
            .${csDocTabs}{
                height: 100%;
                >.ant-tabs-content-holder{
                    height: 100%;
                    >.ant-tabs-content{
                        height: 100%;
                        overflow: hidden;
                    }
                }
            }
            .${csDocEditor}{
                padding: 0;
            }
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
  };
});
