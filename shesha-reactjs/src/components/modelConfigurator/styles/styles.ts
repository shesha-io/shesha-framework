import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, cx, prefixCls }) => {
  const shaModelConfiguratorForm = 'sha-model-configurator-form';
  const shaModelConfiguratorToolbar = 'sha-model-configurator-toolbar';
  const shaModelConfiguratorToolbarLeft = 'sha-model-configurator-toolbar-left';
  const shaModelConfiguratorToolbarRight = 'sha-model-configurator-toolbar-right';

  const sidebarHeaderTitle = 'sidebar-header-title';
  const componentPropertiesActions = 'component-properties-actions';
  const shaModelConfiguratorHeader = 'sha-model-configurator-header';

  const shaModelConfigurator = cx(
    'sha-model-configurator',
    css`
      padding-left: 12px;
      padding-right: 12px;
      height: 100%;
      overflow: hidden;

      .${shaModelConfiguratorForm} {
        height: calc(100vh - 180px);
        display: flex;
        flex-direction: column;
        min-height: 0;

        & > div,
        & > div > .ant-spin-nested-loading,
        & > div > .ant-spin-nested-loading > .ant-spin-container {
          height: 100%;
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        .ant-spin-nested-loading, .ant-spin-container, .ant-form:first-child {
          height: 100%;
          .sha-components-container.vertical, .sha-components-container-inner {
            height: 100%;
            .ant-tabs, .ant-tabs-content, .ant-tabs-tabpane-active {
              height: 100%;
              .shaViewsEditorForm {
                height: 100%;
                overflow: auto;
              }
              .shaPropertiesEditorForm.ant-form-item {
                height: 100%;
                .ant-form-item-row:first-child, .ant-col:first-child, .ant-form-item-control-input-content:first-child {
                  height: 100%;
                  .sidebar-container, .sidebar-container-body, .sidebar-container-main-area {
                    height: 100%;
                    overflow: hidden;
                    .sidebar-container-main-area-body {
                      height: 100%;
                      overflow: auto;
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      .${shaModelConfiguratorToolbar} {
        padding: 12px;

        .${shaModelConfiguratorToolbarLeft} {
          float: left;

          .${prefixCls}-btn {
            margin-right: 2px;
          }
        }

        .${shaModelConfiguratorToolbarRight} {
          float: right;

          .${prefixCls}-btn {
            margin-left: 2px;
          }
        }

        &:after {
          content: '';
          display: block;
          clear: both;
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

      .${shaModelConfiguratorHeader} {
        display: flex;
        justify-content: space-between;
      }
    `
  );
  return {
    shaModelConfiguratorForm,
    shaModelConfigurator,
    shaModelConfiguratorToolbar,
    shaModelConfiguratorToolbarLeft,
    shaModelConfiguratorToolbarRight,
    sidebarHeaderTitle,
    componentPropertiesActions,
    shaModelConfiguratorHeader,
  };
});