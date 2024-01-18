import { createStyles } from "antd-style";

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
    };
});