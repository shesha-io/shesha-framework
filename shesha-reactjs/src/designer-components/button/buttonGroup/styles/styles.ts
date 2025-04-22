import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls, token }) => {
  const shaResponsiveButtonGroup = "sha-responsive-button-group";
  const shaResponsiveButtonGroupInlineContainer = "sha-responsive-button-group-inline-container";
  const shaButtonMenu = "sha-button-menu";
  const a = css`

        .${shaButtonMenu} {
            .${prefixCls}-menu-submenu.${prefixCls}-menu-submenu-popup & {
                padding: unset !important;
                button {
                    color: ${token.colorPrimary} !important;
                    border-color: transparent !important;
                    background: transparent !important;
                    box-shadow: none !important;
                }
            }
        }
    `;

  /*
  // Make sure that all the buttons in the popups are styled like links
  .${prefixCls}-menu-submenu.${prefixCls}-menu-submenu-popup {
    .sha-button-menu {
      padding: unset !important;
      button {
        color: var(--ant-primary-color) !important;
        border-color: transparent !important;
        background: transparent !important;
        box-shadow: none !important;
      }
    }
  }
  */

  const shaResponsiveButtonGroupContainer = cx("sha-responsive-button-group-container", css`
          .${shaResponsiveButtonGroup} {
            line-height: unset;
            min-height: 30px;
            .${prefixCls}-menu-item,
            .${prefixCls}-menu-vertical,
            .${prefixCls}-menu-submenu,
          .${prefixCls}-menu-sub,
          .${prefixCls}-menu-item-only-child {
            padding: unset !important;
          }
      
          &.${prefixCls}-menu-horizontal > .${prefixCls}-menu-item::after,
          &.${prefixCls}-menu-horizontal > .${prefixCls}-menu-submenu::after {
            content: unset;
          }
      
          .${prefixCls}-menu-item.${prefixCls}-menu-item-only-child {
            padding: unset !important;
          }
      
          .${prefixCls}-menu-overflow-item-rest {
            margin-left: 8px;
          }
      
          &.space-small {
            .${prefixCls}-menu-overflow-item,
            .${prefixCls}-menu-overflow-item.${prefixCls}-menu-item.${prefixCls}-menu-item-only-child.${shaButtonMenu} {
              padding-left: 6px !important;
      
              &:first-child,
              &:last-child {
                padding: unset !important;
              }
            }
          }
      
          &.space-middle {
            .${prefixCls}-menu-overflow-item,
            .${prefixCls}-menu-overflow-item.${prefixCls}-menu-item.${prefixCls}-menu-item-only-child.${shaButtonMenu} {
              padding-left: 8px !important;
      
              &:first-child,
              &:last-child {
                padding: unset !important;
              }
            }
          }
      
          &.space-large {
            .${prefixCls}-menu-overflow-item,
            .${prefixCls}-menu-overflow-item.${prefixCls}-menu-item.${prefixCls}-menu-item-only-child.${shaButtonMenu} {
              padding-left: 12px !important;
      
              &:first-child,
              &:last-child {
                padding: unset !important;
              }
            }
          }
        }
  `);
  return {
    shaResponsiveButtonGroupContainer,
    shaResponsiveButtonGroup,
    shaResponsiveButtonGroupInlineContainer,
    a,
  };
});