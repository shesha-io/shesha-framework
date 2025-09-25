import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, iconPrefixCls, responsive, token }) => {
  const shaConfigurableComponent = "sha-configurable-component";
  const shaConfigurableComponentSelected = "sha-configurable-component-selected";
  const shaConfigurableComponentOverlay = "sha-configurable-component-overlay";
  const shaForm = "sha-form";
  const shaEditViewMsg = "sha-edit-view-msg";

  const shaConfigurableModeSwitcherMessageEdit = "sha-configurable-modeswitcher-message-edit";

  const shaConfigurableModeSwitcherMessageLive = cx("sha-configurable-modeswitcher-message-live");

  const shaConfigurableViewButtonWrapper = cx("sha-configurable-view-button-wrapper", css`
      left: 100px;
      top: 100px;
    `);

  const shaConfigurableModeSwitcherLabel = cx("sha-configurable-modeswitcher-label");
  const shaConfigurableModeSwitcherSwitcher = cx("sha-configurable-modeswitcher-switcher", css`
    `);

  const shaAppEditMode = cx("sha-app-editmode", css`
        .${shaConfigurableModeSwitcherMessageEdit} {
          .ant-message-notice-content {
            background-color: #14A38B;
            color: white;
          }
        }

        .sha-configurable-modeswitcher-label {
          color: #14A38B;
        }

        .sha-configurable-modeswitcher-switcher > .ant-switch-inner {
          background-color: #14A38B;
        }

        .${shaConfigurableComponent} {
          position: relative;
          min-height: 30px;
          display: block;
      
          &.${shaConfigurableComponentSelected} {
            border: 2px dashed ${token.colorPrimary};
          }
      
          .${shaConfigurableComponentOverlay} {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 10;
            cursor: pointer;
            display: block;
            min-height: 100%;

            .sha-configurable-logo-button-wrapper {
              position: absolute;
              right: -32px;
              height: 100%;
              vertical-align: middle;
            }

            .sha-configurable-sidemenu-button-wrapper {
              position: fixed;
              left: 14px;
              bottom: 14px;
            }

            .sha-configurable-view-button-wrapper {
              display: flex;
              align-items: center;
              background-color: #14A38B;
              padding: 4px;
              height: 34px;
              overflow-y: hidden;
              width: 100%;
              position: relative;
              z-index: 11;
              pointer-events: auto;
            }
            
            .sha-configurable-view-details {
              background-color: #14A38B;
              color: #ffffff;
            }
            
            .sha-configurable-view-button-wrapper > button {
              color: #ffffff;
              background-color: #14A38B;
              height: 28px;
              position: absolute;
              top: 3px;
              left: calc(50% - 14px);
              border: none;
              z-index: 12;
              display: block;
              visibility: visible;
            }

          .lite{
            background-color: rgba(0, 0, 250, .05);
            margin-left: -5%;
            width: 110%;
            height: 100%;
            padding: 20px;
            padding-top: 10px;
            position: relative;
            
            > button {
              color: #ffffff;
              background-color: #14A38B;
              height: 28px;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              border: none;
              z-index: 12;
            }
          } 
      
          .${shaConfigurableComponentOverlay}:after {
            content: '';
      
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: #ddd;
            opacity: 0.3;
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
        display: flex;
        flex-direction: row;
        position: relative;
        z-index: 1000;

        ${responsive.mobile} {
            display: none;
        }
    `);

  const appModesDropdown = cx("app-modes-dropdown", css`
        .ant-dropdown & {
            background-color: #fff;
      
            .ant-dropdown-menu {
                box-shadow: none;
            }
      
            box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
            0 6px 16px 0 rgba(0, 0, 0, 0.08),
            0 9px 28px 8px rgba(0, 0, 0, 0.05);
        }
    `);

  return {
    shaAppEditMode,
    shaConfigurableComponent,
    shaConfigurableComponentSelected,
    shaConfigurableComponentOverlay,
    shaConfigItemModeToggler,
    shaConfigurableViewButtonWrapper,
    shaConfigurableModeSwitcherSwitcher,
    shaConfigurableModeSwitcherLabel,
    shaConfigurableModeSwitcherMessageLive,
    shaConfigurableModeSwitcherMessageEdit,
    appModesDropdown,
    shaEditViewMsg,
  };
});
