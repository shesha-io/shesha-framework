import { createStyles, sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token, prefixCls, iconPrefixCls }) => {
  const shaSettingsEditorToolbar = "sha-settings-editor-toolbar";
  const shaSettingsEditorToolbarLeft = "sha-settings-editor-toolbar-left";
  const shaSettingsEditorToolbarRight = "sha-settings-editor-toolbar-right";
  const shaSettingsEditorMain = "sha-settings-editor-main";
  const shaSettingsEditorToolbox = "sha-settings-editor-toolbox";
  const shaSettingSearch = "sha-setting-search";
  const shaToolboxPanel = "sha-toolbox-panel";
  const shaToolboxComponent = "sha-toolbox-component";
  const shaSettingsEditorHeader = "sha-settings-editor-header";
  const shaDesignerHeaderRight = "sha-designer-header-right";

  const shaSettingsEditor = cx("sha-settings-editor", css`
        .${shaSettingsEditorToolbar} {
          background: white;
          padding: 12px;
          display: flex;
          justify-content: space-between;
      
          .${shaSettingsEditorToolbarLeft} {
            float: left;
      
            .${prefixCls}-btn {
              margin-right: 2px;
            }
          }
      
          .${shaSettingsEditorToolbarRight} {
            float: right;
      
            .${prefixCls}-btn {
              margin-left: 2px;
            }
          }
        }
      
        .${shaSettingsEditorMain} {
          padding: 8px;
          background-color: white;
        }
      
        .${shaSettingsEditorToolbox} {
          padding: 8px;
          height: 100%;
          background-color: white;
      
          .${prefixCls}-collapse-item {
            .${prefixCls}-collapse-header {
              padding: 4px 8px;
      
              &:hover {
                color: ${token.colorPrimary};
                background-color: ${token.colorPrimaryBgHover};
              }
            }
          }
      
          .${prefixCls}-menu-item {
            height: 24px;
            line-height: 24px;
            margin-bottom: 4px !important;
          }
      
          .${shaSettingSearch} {
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
      
        .${shaSettingsEditorHeader} {
          display: flex;
          justify-content: space-between;
      
          .${shaDesignerHeaderRight} {
            .${prefixCls}-btn-link {
              &:hover {
                border-radius: 5px;
                color: ${token.colorPrimary};
                background-color: ${token.colorPrimaryBgHover};
              }
            }
          }
        }
  `);

  const prefix = "sha-settings";
  const split = "split";
  const mainArea = `${prefix}-main`;
  const propsPanel = `${prefix}-props`;
  const propsPanelContent = `${prefix}-props-content`;


  const propsPanelHeader = `${prefix}-props-header`;
  const propsPanelTitle = `${prefix}-props-title`;

  const propsPanelBody = `${prefix}-props-body`;
  const propsPanelBodyContent = `${prefix}-props-content`;

  const container = cx(prefix, css`
      width: 100%;
      height: calc(100vh - 160px);
      display: flex;
      flex-direction: row;
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;

      .${mainArea} {
        overflow-x: hidden;
        overflow-y: auto;
        padding-right: 5px;
        height: calc(100vh - 160px);
        ${sheshaStyles.thinScrollbars}
        
        .ant-spin-nested-loading {
          height: 100%;
          .ant-spin-container{
            height: 100%;
          }
        }
      }

      .${propsPanel} {
        overflow-x: hidden;
        overflow-y: auto;
        background: white;
        height: calc(100vh - 160px);
        
        .${propsPanelContent} {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          height: 100%;

          .${propsPanelHeader} {
            display: flex;
            height: 47px;
            min-height: 47px;
    
            .${propsPanelTitle} {
              display: flex;
              background: #282828;
              align-items: center;
              padding: 0 ${sheshaStyles.paddingLG}px;
              font-weight: 500;
              font-size: 16px;
              color: white;
              flex-grow: 1;
            }
          }
  
          .${propsPanelBody} {
            flex-grow: 1;
            overflow: hidden;
            ${sheshaStyles.thinScrollbars}
  
            padding: ${sheshaStyles.paddingLG}px;
    
            .${propsPanelBodyContent} {
              width: 100%;
            }
          }
        }
      }
  `);

  return {
    shaSettingsEditor,
    shaSettingsEditorToolbar,
    shaSettingsEditorToolbarLeft,
    shaSettingsEditorToolbarRight,
    shaSettingsEditorMain,
    shaSettingsEditorToolbox,
    shaSettingSearch,
    shaToolboxPanel,
    shaToolboxComponent,
    shaSettingsEditorHeader,
    shaDesignerHeaderRight,
    propsPanelHeader,
    propsPanelTitle,
    propsPanelBody,
    propsPanelBodyContent,
    container,
    split,
    mainArea,
    propsPanel,
    propsPanelContent,
  };
});
