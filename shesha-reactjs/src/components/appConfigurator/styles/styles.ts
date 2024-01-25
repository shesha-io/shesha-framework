import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx, iconPrefixCls, responsive }) => {
    const shaConfigurableComponent = "sha-configurable-component";
    const shaConfigurableComponentSelected = "sha-configurable-component-selected";    
    const shaConfigurableComponentOverlay = "sha-configurable-component-overlay";
    const shaForm = "sha-form";
    const shaEditViewMsg = "sha-edit-view-msg";

    const shaAppEditMode = cx("sha-app-editmode", css`
        .${shaConfigurableComponent} {
          position: relative;
          border: 2px dashed #ddd;
          min-height: 30px;
      
          &:hover {
            border: 2px dashed #4099ff;
          }
      
          &.${shaConfigurableComponentSelected} {
            border: 2px dashed #4099ff;
          }
      
          .${shaConfigurableComponentOverlay} {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            cursor: pointer;
          }
      
          .${shaConfigurableComponentOverlay}:after {
            content: '';
      
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: #ddd;
            opacity: 0.2;
          }
      
          .${shaForm} {
            min-height: 120px;
          }
      
          .${shaEditViewMsg} {
            width: 200px;
            height: auto;
            margin: auto;
            background-color: #fff;
            text-align: center;
            border: 2px solid #fff;
            position: absolute;
            left: 50%;
            top: 50%;
            margin-left: -100px;
            margin-top: -55px;
            border-radius: 10px;
            z-index: 1000;
            padding: 15px 5px;
      
            .${iconPrefixCls}-edit {
              font-size: 26px;
            }
      
            h3 {
              margin-bottom: 0;
            }
      
            p {
              color: lightgray;
              margin-bottom: 0;
            }
          }
        }
    `);

    const shaConfigItemModeToggler = cx("sha-config-item-mode-toggler", css`
        display: inline-block;

        ${responsive.mobile} {
            display: none;
        }
    `);

    const appModesDropdown = cx("app-modes-dropdown", css`
        .ant-dropdown & {
            background-color: #fff; //@dropdown-menu-bg;
      
            .ant-dropdown-menu {
                box-shadow: none;
            }
      
            box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
            0 6px 16px 0 rgba(0, 0, 0, 0.08),
            0 9px 28px 8px rgba(0, 0, 0, 0.05); //@box-shadow-base
        }
    `);

    return {
        shaAppEditMode,
        shaConfigurableComponent,
        shaConfigurableComponentSelected,
        shaConfigurableComponentOverlay,
        shaConfigItemModeToggler,
        appModesDropdown,
        shaEditViewMsg,
    };
});