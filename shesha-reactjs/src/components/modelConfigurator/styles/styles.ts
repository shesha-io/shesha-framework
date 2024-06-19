import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, cx, prefixCls }) => {
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
      height: 100vh;
      overflow: scroll;
  
      
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
    shaModelConfigurator,
    shaModelConfiguratorToolbar,
    shaModelConfiguratorToolbarLeft,
    shaModelConfiguratorToolbarRight,
    sidebarHeaderTitle,
    componentPropertiesActions,
    shaModelConfiguratorHeader,
  };
});