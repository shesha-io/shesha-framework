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
  const csTreeFilterButton = 'sha-cs-tree-filter-btn';
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
                display: flex;
                align-items: center;
                gap: 8px;

                /* Contextual grouping: Form/Canvas -> user actions -> avatar, split by separators (issue #4783). */
                .${prefixCls}-divider {
                    height: 24px;
                    margin: 0 4px;
                    border-inline-start-color: ${token.colorBorder};
                }

                /* Icons sit on the left of the label rather than centred with it. */
                .${prefixCls}-btn > .${iconPrefixCls} + span {
                    margin-inline-start: 6px;
                }
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
            /* Darker divider so the panel reads as separate from the work area (issue #4783). */
            border-right: 1px solid ${token.colorBorder};
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
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    /* Let the search box take the slack so the filter button keeps its size. */
                    >.${prefixCls}-input-group-wrapper,
                    >.${prefixCls}-input-wrapper {
                        flex: 1 1 auto;
                        min-width: 0;
                    }
                    .${prefixCls}-badge {
                        flex: 0 0 auto;
                    }
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

                      /* Cleaner drag handle: a subtle grip that only appears on hover (issue #4783). */
                      .${prefixCls}-tree-draggable-icon {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 12px;
                        opacity: 0;
                        cursor: grab;
                        color: ${token.colorTextQuaternary};
                        transition: opacity 0.2s;
                      }
                      &:hover .${prefixCls}-tree-draggable-icon {
                        opacity: 1;
                      }

                      /* Darker, more emphasised selection (issue #4783). */
                      .${prefixCls}-tree-node-content-wrapper.${prefixCls}-tree-node-selected {
                        background-color: ${token.colorPrimaryBg};
                        color: ${token.colorPrimaryText};
                        font-weight: 500;
                      }

                      /* Inline folder-name editor row (issue #4783). */
                      &.sha-cs-tree-folder-draft {
                        .${prefixCls}-tree-node-content-wrapper {
                          cursor: default;
                          &:hover {
                            background: transparent;
                          }
                        }
                        .${prefixCls}-tree-title {
                          display: block;
                          width: 100%;
                          /* The editor must keep its full width instead of being clipped like a label. */
                          overflow: visible;
                        }
                        .${prefixCls}-tree-switcher {
                          visibility: hidden;
                        }
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
            flex-grow: 1 !important;
            .${csDocTabs}{
                height: 100%;
                /* Reduced tab height and a darker tab-bar rule (issue #4783). */
                >.ant-tabs-nav {
                    margin-bottom: 0;
                    &::before {
                        border-bottom-color: ${token.colorBorder};
                    }
                    .ant-tabs-tab {
                        padding-top: 6px;
                        padding-bottom: 6px;
                    }
                }
                >.ant-tabs-body-holder {
                    height: 100%;
                    ${sheshaStyles.thinScrollbars}
                    >.ant-tabs-body {
                        height: 100%;
                        overflow: hidden;
                        >.ant-tabs-content {
                            height: 100%;
                        }
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
            overflow: auto;
            ${sheshaStyles.thinScrollbars}
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
    csTreeFilterButton,
    csQuickInfoIcons,
    csDocTabs,
    csDocEditor,
    csWorkAreaEmpty,
  };
});
