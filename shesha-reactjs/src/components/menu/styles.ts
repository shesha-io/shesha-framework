import { createGlobalStyle, createStyles, SerializedStyles } from "antd-style";
import { ILayoutColor } from "./model";

interface IStyleProps {
  colors?: ILayoutColor | undefined;
  fontSize?: string | undefined;
  isScrolling: boolean;
  padding?: { x: number; y: number } | undefined;
  itemStyle?: string | undefined;
  styleOnHover?: string | undefined;
  styleOnSelected?: string | undefined;
  menuItemStyle?: string | undefined;
  width?: string | undefined;
  fontStyles?: React.CSSProperties | undefined;
}

interface IGlobalMenuProps {
  colors?: ILayoutColor | undefined;
  padding?: { x: number; y: number } | undefined;
  itemStyle?: string | undefined;
  styleOnHover?: string | undefined;
  styleOnSelected?: string | undefined;
  styleOnSubMenu?: string | undefined;
  menuItemStyle?: string | undefined;
  fontStyles?: React.CSSProperties | undefined;
  menuId?: string | undefined;
}

const BLACK_CLR = "#000000e0";

export type StyleResponse = {
  menuContainer: SerializedStyles;
  menuWrapper: SerializedStyles;
  menuWrapperScroll: SerializedStyles | undefined;
  shaMenu: string;
  shaHamburgerItem: SerializedStyles;
  scrollButtons: string;
  scrollButton: string;
};

export const useStyles = createStyles<IStyleProps, StyleResponse>(
  (
    { css, cx, prefixCls },
    {
      fontSize,
      colors,
      isScrolling,
      padding,
      itemStyle,
      styleOnHover,
      styleOnSelected,
      menuItemStyle,
      width,
      fontStyles,
    }: IStyleProps,
  ) => {
    const menuContainer = css`
      display: flex;
      flex-direction: row;
      white-space: nowrap;
      align-items: stretch;
      height: auto;
      min-height: 100%;
      width: ${width};
      overflow: visible;
      padding: 4px 0;
    `;

    const menuWrapper = css`
      flex-direction: row;
      white-space: nowrap;
      align-items: center;
      scroll-behavior: smooth;
      scrollbar-width: none;
      overflow-y: visible;
      margin: 0;
      padding: 0;

      ::-webkit-scrollbar {
        display: none;
      }
    `;

    const menuWrapperScroll = isScrolling
      ? css`
        display: flex;
        width: calc(${width} - 80px);
        overflow-x: scroll;
        overflow-y: visible;
      `
      : undefined;

    const shaMenu = cx(
      `.${prefixCls}-menu`,
      css`
        border: none;
        width: ${isScrolling ? 'auto' : width};
        min-width: ${isScrolling ? width : 'auto'};
        ${colors?.itemBackground ? `background: ${colors.itemBackground};` : ''}
        font-size: ${fontSize ? `${fontSize}px` : fontStyles?.fontSize};
        font-weight: ${fontStyles?.fontWeight};
        font-family: ${fontStyles?.fontFamily};

        .${prefixCls}-menu-item::after,
          .${prefixCls}-menu-item-active::after,
          .${prefixCls}-menu-item-selected::after,
          .${prefixCls}-menu-submenu::after,
          .${prefixCls}-menu-submenu-open::after,
          .${prefixCls}-menu-submenu-active::after {
          border: none !important;
        }

        /* Show arrows for horizontal menu items with children */
        &.${prefixCls}-menu-horizontal > .${prefixCls}-menu-submenu > .${prefixCls}-menu-submenu-title .${prefixCls}-menu-submenu-arrow {
          display: inline-block !important;
        }

        .${prefixCls}-menu-item {
          padding: ${padding?.y ? `${padding.y}px` : '0'} ${padding?.x ? `${padding.x}px` : '3px'} !important;
          color: ${colors?.itemColor ?? BLACK_CLR};
          ${colors?.itemBackground ? `background: ${colors.itemBackground};` : ''}
          margin-right: 0;
          font-family: ${fontStyles?.fontFamily};
          font-size: ${fontSize ? `${fontSize}px` : fontStyles?.fontSize};
          font-weight: ${fontStyles?.fontWeight};
          ${menuItemStyle || ''}
          ${itemStyle || ''}

          .anticon {
            margin-left: 10px;
          }
        }

        /* Only apply to top-level submenus */
        &.${prefixCls}-menu-horizontal > .${prefixCls}-menu-submenu {
          padding: 0 !important;
          border-radius: 0 !important;

          > .${prefixCls}-menu-submenu-title {
            color: ${colors?.itemColor ?? BLACK_CLR};
            font-family: ${fontStyles?.fontFamily};
            font-size: ${fontSize ? `${fontSize}px` : fontStyles?.fontSize};
            font-weight: ${fontStyles?.fontWeight};
            ${itemStyle || ''}
            display: flex !important;
            align-items: center !important;
            padding: ${padding?.y ? `${padding.y}px` : '0'} ${padding?.x ? `${padding.x}px` : '3px'} !important;
            border-radius: 0 !important;

            .${prefixCls}-menu-title-content {
              flex: 1 !important;
              display: flex !important;
              align-items: center !important;
            }

            .${prefixCls}-icon {
              font-size: ${fontSize ? `${fontSize}px` : fontStyles?.fontSize};
              color: ${colors?.itemColor ?? BLACK_CLR};
              margin-left: 10px;

              &:hover {
                ${styleOnHover || ''}
                ${!styleOnHover ? `color: ${colors?.hoverItemColor || BLACK_CLR};` : ''}
              }
            }

            .anticon {
              margin-left: 10px;
            }

            .${prefixCls}-menu-submenu-arrow {
              margin-left: auto !important;
              padding-left: 4px !important;
              position: static !important;
              display: inline-block !important;
              inset: unset !important;
              transform: none !important;
              color: ${colors?.itemColor ?? BLACK_CLR} !important;
            }
          }

        }

        /* Apply hover styles specifically to top-level submenu title, not container */
        &.${prefixCls}-menu-horizontal > .${prefixCls}-menu-submenu:hover {
          > .${prefixCls}-menu-submenu-title {
            color: ${colors?.hoverItemColor || BLACK_CLR};
            background: ${colors?.hoverItemBackground || 'white'} !important;
            ${styleOnHover || ''}

            .${prefixCls}-icon,
            .anticon {
              ${!styleOnHover ? `color: ${colors?.hoverItemColor || BLACK_CLR};` : ''}
            }

            .${prefixCls}-menu-submenu-arrow {
              ${!styleOnHover ? `color: ${colors?.hoverItemColor || BLACK_CLR} !important;` : ''}
            }
          }
        }

        /* Apply hover styles to regular menu items */
        .${prefixCls}-menu-item:hover {
          color: ${colors?.hoverItemColor || BLACK_CLR};
          background: ${colors?.hoverItemBackground || 'white'} !important;
          ${styleOnHover || ''}

          .anticon {
            ${!styleOnHover ? `color: ${colors?.hoverItemColor || BLACK_CLR};` : ''}
          }
        }

        .${prefixCls}-menu-item-active {
          color: ${colors?.hoverItemColor || BLACK_CLR};
          background: ${colors?.hoverItemBackground || 'white'} !important;
          ${styleOnHover || ''}
        }

        .${prefixCls}-menu-submenu-active {
          /* Removed hover styles from active state - they should only apply on :hover */
        }

        &.${prefixCls}-menu-horizontal > .${prefixCls}-menu-submenu-active.${prefixCls}-menu-submenu-selected {
          background: ${colors?.selectedItemBackground
            ? `${colors.selectedItemBackground} !important`
            : "white"};

          > .${prefixCls}-menu-submenu-title {
            color: ${colors?.selectedItemColor
              ? `${colors.selectedItemColor} !important`
              : BLACK_CLR};
            font-family: ${fontStyles?.fontFamily};
            font-size: ${fontSize ? `${fontSize}px` : fontStyles?.fontSize};
            font-weight: ${fontStyles?.fontWeight};
          }
          ${styleOnSelected || ''}
        }

        .${prefixCls}-menu-item-selected {
          background: ${colors?.selectedItemBackground
            ? `${colors.selectedItemBackground} !important`
            : "white"};
          color: ${colors?.selectedItemColor
            ? `${colors.selectedItemColor} !important`
            : BLACK_CLR};
          ${styleOnSelected || ''}
        }

        &.${prefixCls}-menu-horizontal > .${prefixCls}-menu-submenu-selected {
          background: ${colors?.selectedItemBackground
            ? `${colors.selectedItemBackground} !important`
            : "white"};

          > .${prefixCls}-menu-submenu-title {
            color: ${colors?.selectedItemColor
              ? `${colors.selectedItemColor} !important`
              : BLACK_CLR};
            font-family: ${fontStyles?.fontFamily};
            font-size: ${fontSize ? `${fontSize}px` : fontStyles?.fontSize};
            font-weight: ${fontStyles?.fontWeight};
          }
          ${styleOnSelected || ''}
        }

        ::-webkit-scrollbar {
          display: none;
        }
      `,
    );

    const shaHamburgerItem = css`
      .${prefixCls}icon {
        &.${prefixCls}icon-menu {
          margin-right: 10px;
        }
      }
    `;

    const scrollButtons = cx(css`
      width: 80px;
      display: flex;
      height: 100%;
      color: ${colors?.itemColor};
      ${colors?.itemBackground ? `background: ${colors.itemBackground};` : ''}
      flex-direction: row;
      justify-content: center;
      align-items: center;
      margin: 0;
      padding: 0;
      gap: 0;
    `);

    const scrollButton = cx(css`
      cursor: pointer;
      padding: 0 5px;
      margin: 0;
      transition: background 0.3s;
      width: 45%;
      align-items: center;
      height: 100%;
      justify-content: center;
      display: flex;
      ${colors?.itemBackground ? `background: ${colors.itemBackground};` : ''}
      ${menuItemStyle || ''}

      &:hover {
        background: ${colors?.hoverItemBackground
          ? `${colors.hoverItemBackground}`
          : "#e8e8e8"};
        color: ${colors?.hoverItemColor || BLACK_CLR};
        z-index: 1;

        ${styleOnHover}
      }
    `);

    return {
      menuContainer,
      menuWrapper,
      menuWrapperScroll,
      shaMenu,
      shaHamburgerItem,
      scrollButtons,
      scrollButton,
    } satisfies StyleResponse;
  },
);

export const GlobalMenuStyles = createGlobalStyle<IGlobalMenuProps>`
  /* Enable text overflow with ellipsis for all menu items */
  .${(p) => p.theme.prefixCls}-menu-title-content {
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }

  /* Standardize dropdown widths globally */
  .${(p) => p.theme.prefixCls}-menu-submenu-popup .${(p) => p.theme.prefixCls}-menu {
    min-width: 200px !important;
    max-width: 400px !important;
    width: 200px !important;
  }

  /* Show arrows for horizontal menu items with children */
  .${(p) => p.theme.prefixCls}-menu-horizontal > .${(p) => p.theme.prefixCls}-menu-submenu > .${(p) => p.theme.prefixCls}-menu-submenu-title .${(p) => p.theme.prefixCls}-menu-submenu-arrow {
    display: inline-block !important;
  }

  .${(p) => p.theme.prefixCls}-menu-sub,
  .${(p) => p.theme.prefixCls}-menu-inline,
  .${(p) => p.theme.prefixCls}-menu {

    border: none !important;
    box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05) !important;
    font-family: ${(p) => p.fontStyles?.fontFamily} !important;
    font-weight: ${(p) => p.fontStyles?.fontWeight} !important;
    text-align: ${(p) => p.fontStyles?.textAlign} !important;

    .${(p) => p.theme.prefixCls}-menu-submenu-arrow {
      display: none !important;
    }

    .${(p) => p.theme.prefixCls}-menu-item {
      color: ${(p) => p.colors?.itemColor || BLACK_CLR};
      ${(p) => p.colors?.itemBackground ? `background: ${p.colors.itemBackground};` : ''}
      font-family: ${(p) => p.fontStyles?.fontFamily} !important;
      font-weight: ${(p) => p.fontStyles?.fontWeight} !important;
      text-align: ${(p) => p.fontStyles?.textAlign} !important;
      ${(p) => p.menuItemStyle || ''}
      ${(p) => p.itemStyle || ''}

      .anticon {
        margin-right: 10px !important;
        margin-left: 0 !important;
      }

      &:hover {
        color: ${(p) => p.colors?.hoverItemColor || BLACK_CLR};
        background: ${(p) => p.colors?.hoverItemBackground || 'white'} !important;
        ${(p) => p.styleOnHover || ''}

        .anticon {
          ${(p) => !p.styleOnHover ? `color: ${p.colors?.hoverItemColor || BLACK_CLR};` : ''}
        }
      }

      &.${(p) => p.theme.prefixCls}-menu-item-selected {
        color: ${(p) => p.colors?.selectedItemColor || BLACK_CLR} !important;
        background: ${(p) => p.colors?.selectedItemBackground || 'white'} !important;
        ${(p) => p.styleOnSelected || ''}
      }
    }

    /* Parent submenu items (items that have children) */
    .${(p) => p.theme.prefixCls}-menu-submenu {
      padding: 0 !important;
      border-radius: 0 !important;

      .${(p) => p.theme.prefixCls}-menu-submenu-title {
        color: ${(p) => p.colors?.itemColor || BLACK_CLR};
        ${(p) => p.colors?.itemBackground ? `background: ${p.colors.itemBackground};` : ''}
        border-radius: 0 !important;
        font-family: ${(p) => p.fontStyles?.fontFamily} !important;
        font-weight: ${(p) => p.fontStyles?.fontWeight} !important;
        text-align: ${(p) => p.fontStyles?.textAlign} !important;
        ${(p) => p.menuItemStyle || ''}
        ${(p) => p.itemStyle || ''}
        display: flex !important;
        align-items: center !important;

        .${(p) => p.theme.prefixCls}-menu-title-content {
          flex: 1 !important;
          display: flex !important;
          align-items: center !important;
        }

        .anticon {
          margin-right: 10px !important;
          margin-left: 0 !important;
        }

        .${(p) => p.theme.prefixCls}-menu-submenu-arrow {
          color: ${(p) => p.colors?.itemColor || BLACK_CLR};
          margin-left: auto !important;
          padding-left: 4px !important;
          position: static !important;
          display: inline-block !important;
          inset: unset !important;
          transform: none !important;
        }
      }

      /* Apply hover styles to title */
      &:hover {
        .${(p) => p.theme.prefixCls}-menu-submenu-title {
          color: ${(p) => p.colors?.hoverItemColor || BLACK_CLR};
          background: ${(p) => p.colors?.hoverItemBackground || 'white'} !important;
          ${(p) => p.styleOnHover || ''}

          .anticon {
            ${(p) => !p.styleOnHover ? `color: ${p.colors?.hoverItemColor || BLACK_CLR};` : ''}
          }

          .${(p) => p.theme.prefixCls}-menu-submenu-arrow {
            ${(p) => !p.styleOnHover ? `color: ${p.colors?.hoverItemColor || BLACK_CLR} !important;` : ''}
          }
        }
      }

      &.${(p) => p.theme.prefixCls}-menu-submenu-selected {
        .${(p) => p.theme.prefixCls}-menu-submenu-title {
          color: ${(p) => p.colors?.selectedItemColor || BLACK_CLR} !important;
          background: ${(p) => p.colors?.selectedItemBackground || 'white'} !important;
          ${(p) => p.styleOnSelected || ''}
        }
      }
    }

    .${(p) => p.theme.prefixCls}-menu-item-active {
      ${(p) => p.styleOnHover || `
        color: ${p.colors?.hoverItemColor || BLACK_CLR};
        background: ${p.colors?.hoverItemBackground || 'white'};
      `}

      .${(p) => p.theme.prefixCls}-menu-title-content {
        ${(p) => !p.styleOnHover ? `color: ${p.colors?.hoverItemColor || BLACK_CLR};` : ''}
      }

      .anticon {
        ${(p) => !p.styleOnHover ? `color: ${p.colors?.hoverItemColor || BLACK_CLR};` : ''}
      }
    }

    .${(p) => p.theme.prefixCls}-menu-submenu-active {
      /* Removed hover styles from active state - they should only apply on :hover */

      /* When submenu has a selected child */
      &.${(p) => p.theme.prefixCls}-menu-submenu-selected {
        .${(p) => p.theme.prefixCls}-menu-submenu-title {
          color: ${(p) => p.colors?.selectedItemColor || BLACK_CLR} !important;
          background: ${(p) => p.colors?.selectedItemBackground || 'white'} !important;
          ${(p) => p.styleOnSelected || ''}
        }
      }
    }
  }

  /* Drawer menu items - ensure consistent height and padding for all items */
  .horizontal-menu-drawer-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-item,
  .horizontal-menu-drawer-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-submenu .${(p) => p.theme.prefixCls}-menu-submenu-title {
    height: 40px !important;
    line-height: 40px !important;
  }

  /* Ensure regular items match submenu title padding */
  .horizontal-menu-drawer-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-item {
    padding: ${(p) => p.padding?.y ? `${p.padding.y}px` : '0'} ${(p) => p.padding?.x ? `${p.padding.x}px` : '3px'} !important;
  }

  /* Drawer submenu items - use subItem colors */
  .horizontal-menu-drawer-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-sub .${(p) => p.theme.prefixCls}-menu-item {
    color: ${(p) => p.colors?.subItemColor || BLACK_CLR} !important;
    ${(p) => p.colors?.subItemBackground ? `background: ${p.colors?.subItemBackground} !important;` : ''}
    ${(p) => p.styleOnSubMenu || ''};

    .anticon {
      color: ${(p) => p.colors?.subItemColor || BLACK_CLR} !important;
    }

    &:hover {
      color: ${(p) => p.colors?.hoverItemColor || BLACK_CLR} !important;
      background: ${(p) => p.colors?.hoverItemBackground || 'white'} !important;
      ${(p) => p.styleOnHover || ''};

      .anticon {
        ${(p) => !p.styleOnHover ? `color: ${p.colors?.hoverItemColor || BLACK_CLR} !important;` : ''}
      }
    }

    &.${(p) => p.theme.prefixCls}-menu-item-selected {
      color: ${(p) => p.colors?.selectedItemColor || BLACK_CLR} !important;
      background: ${(p) => p.colors?.selectedItemBackground || 'white'} !important;
      ${(p) => p.styleOnSelected || ''};
    }
  }

  .horizontal-menu-drawer-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-sub .${(p) => p.theme.prefixCls}-menu-submenu-title {
    color: ${(p) => p.colors?.subItemColor || BLACK_CLR} !important;
    ${(p) => p.colors?.subItemBackground ? `background: ${p.colors?.subItemBackground} !important;` : ''}
    ${(p) => p.styleOnSubMenu || ''};

    .anticon {
      color: ${(p) => p.colors?.subItemColor || BLACK_CLR} !important;
    }

    .${(p) => p.theme.prefixCls}-menu-submenu-arrow {
      color: ${(p) => p.colors?.subItemColor || BLACK_CLR} !important;
    }

    &:hover {
      color: ${(p) => p.colors?.hoverItemColor || BLACK_CLR} !important;
      background: ${(p) => p.colors?.hoverItemBackground || 'white'} !important;
      ${(p) => p.styleOnHover || ''};

      .anticon {
        ${(p) => !p.styleOnHover ? `color: ${p.colors?.hoverItemColor || BLACK_CLR} !important;` : ''}
      }

      .${(p) => p.theme.prefixCls}-menu-submenu-arrow {
        ${(p) => !p.styleOnHover ? `color: ${p.colors?.hoverItemColor || BLACK_CLR} !important;` : ''}
      }
    }
  }

  .horizontal-menu-drawer-${(p) => p.menuId}
    .${(p) => p.theme.prefixCls}-menu-sub
    .${(p) => p.theme.prefixCls}-menu-submenu.${(p) =>
      p.theme.prefixCls}-menu-submenu-selected
    .${(p) => p.theme.prefixCls}-menu-submenu-title {
    color: ${(p) => p.colors?.selectedItemColor || BLACK_CLR} !important;
    background: ${(p) => p.colors?.selectedItemBackground || 'white'} !important;
    ${(p) => p.styleOnSelected || ''};
  }
`;

export const ScopedMenuStyles = createGlobalStyle<IGlobalMenuProps>`
  /* Enable text overflow with ellipsis for all menu items in scoped menus */
  .horizontal-menu-drawer-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-title-content,
  .horizontal-menu-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-title-content {
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }

  /* Standardize dropdown widths for scoped horizontal menus */
  .horizontal-menu-${(p) => p.menuId}-dropdown.${(p) => p.theme.prefixCls}-menu-submenu-popup .${(p) => p.theme.prefixCls}-menu {
    min-width: 200px !important;
    max-width: 400px !important;
    width: 200px !important;
  }

  /* Show arrows for horizontal menu items with children */
  .horizontal-menu-${(p) => p.menuId}.${(p) => p.theme.prefixCls}-menu-horizontal
    > .${(p) => p.theme.prefixCls}-menu-submenu
    > .${(p) => p.theme.prefixCls}-menu-submenu-title
    .${(p) => p.theme.prefixCls}-menu-submenu-arrow {
    display: inline-block !important;
  }

  .horizontal-menu-drawer-${(p) => p.menuId}.${(p) => p.theme.prefixCls}-drawer {
    .${(p) => p.theme.prefixCls}-drawer-content-wrapper,
    .${(p) => p.theme.prefixCls}-drawer-content {
    }
    .${(p) => p.theme.prefixCls}-drawer-header {
      color: ${(p) => p.colors?.itemColor || BLACK_CLR};
      font-family: ${(p) => p.fontStyles?.fontFamily} !important;
      font-weight: ${(p) => p.fontStyles?.fontWeight} !important;
      text-align: ${(p) => p.fontStyles?.textAlign} !important;
      border-bottom: none !important;

      .${(p) => p.theme.prefixCls}-drawer-title {
        color: ${(p) => p.colors?.itemColor || BLACK_CLR};
        font-family: ${(p) => p.fontStyles?.fontFamily} !important;
        font-weight: ${(p) => p.fontStyles?.fontWeight} !important;
        text-align: ${(p) => p.fontStyles?.textAlign} !important;
      }
    }

    .${(p) => p.theme.prefixCls}-drawer-body {
      padding: 0 !important;
    }
  }

  /* Submenu container styles for drawer */
  .horizontal-menu-drawer-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-sub {
    border: none !important;
    font-family: ${(p) => p.fontStyles?.fontFamily} !important;
    font-weight: ${(p) => p.fontStyles?.fontWeight} !important;
    text-align: ${(p) => p.fontStyles?.textAlign} !important;
  }

  /* Override Ant Design's default grey background on inline submenus */
  .horizontal-menu-drawer-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-inline .${(p) => p.theme.prefixCls}-menu-sub.${(p) => p.theme.prefixCls}-menu-inline {
    background: ${(p) => p.colors?.subItemBackground || 'white'} !important;
  }

  /* Submenu container styles for horizontal menu dropdowns */
  .horizontal-menu-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-sub,
  .horizontal-menu-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-inline,
  .horizontal-menu-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu {
    border: none !important;
    font-family: ${(p) => p.fontStyles?.fontFamily} !important;
    font-weight: ${(p) => p.fontStyles?.fontWeight} !important;
    text-align: ${(p) => p.fontStyles?.textAlign} !important;
  }

  /* Hide submenu arrows only for horizontal menu (not drawer) */
  .horizontal-menu-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-sub,
  .horizontal-menu-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-inline,
  .horizontal-menu-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu {
    .${(p) => p.theme.prefixCls}-menu-submenu-arrow {
      display: none !important;
    }
  }

  /* Show submenu arrows for drawer menu */
  .horizontal-menu-drawer-${(p) => p.menuId}.${(p) => p.theme.prefixCls}-drawer .${(p) => p.theme.prefixCls}-drawer-body .${(p) => p.theme.prefixCls}-menu-sub,
  .horizontal-menu-drawer-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-sub,
  .horizontal-menu-drawer-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-inline,
  .horizontal-menu-drawer-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu,
  .horizontal-menu-drawer-${(p) => p.menuId}-menu.${(p) => p.theme.prefixCls}-menu .${(p) => p.theme.prefixCls}-menu-sub,
  .horizontal-menu-drawer-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-drawer-body .${(p) => p.theme.prefixCls}-menu-sub {
    .${(p) => p.theme.prefixCls}-menu-submenu-arrow {
      display: inline-block !important;
    }
  }

  .horizontal-menu-drawer-${(p) => p.menuId}.${(p) => p.theme.prefixCls}-drawer .${(p) => p.theme.prefixCls}-drawer-body .${(p) => p.theme.prefixCls}-menu-sub,
  .horizontal-menu-drawer-${(p) => p.menuId}.${(p) => p.theme.prefixCls}-drawer .${(p) => p.theme.prefixCls}-drawer-body .${(p) => p.theme.prefixCls}-menu-sub,
  .horizontal-menu-drawer-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-sub,
  .horizontal-menu-drawer-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-inline,
  .horizontal-menu-drawer-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu,
  .horizontal-menu-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-sub,
  .horizontal-menu-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-inline,
  .horizontal-menu-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu {

    .${(p) => p.theme.prefixCls}-menu-item {
      color: ${(p) => p.colors?.itemColor || BLACK_CLR};
      ${(p) => p.colors?.itemBackground ? `background: ${p.colors.itemBackground};` : ''}
      font-family: ${(p) => p.fontStyles?.fontFamily} !important;
      font-weight: ${(p) => p.fontStyles?.fontWeight} !important;
      text-align: ${(p) => p.fontStyles?.textAlign} !important;
      ${(p) => p.menuItemStyle || ''}
      ${(p) => p.itemStyle || ''}

      .anticon {
        margin-right: 10px !important;
        margin-left: 0 !important;
      }

      &:hover {
        color: ${(p) => p.colors?.hoverItemColor || BLACK_CLR};
        background: ${(p) => p.colors?.hoverItemBackground || 'white'} !important;
        ${(p) => p.styleOnHover || ''}

        .anticon {
          ${(p) => !p.styleOnHover ? `color: ${p.colors?.hoverItemColor || BLACK_CLR};` : ''}
        }
      }

      &.${(p) => p.theme.prefixCls}-menu-item-selected {
        ${(p) => p.styleOnSelected || `
          color: ${p.colors?.selectedItemColor || BLACK_CLR} !important;
          background: ${p.colors?.selectedItemBackground || 'white'} !important;
        `}
      }
    }

    .${(p) => p.theme.prefixCls}-menu-submenu {
      .${(p) => p.theme.prefixCls}-menu-submenu-title {
        color: ${(p) => p.colors?.itemColor || BLACK_CLR};
        ${(p) => p.colors?.itemBackground ? `background: ${p.colors.itemBackground};` : ''}
        padding: ${(p) => p.padding?.y ? `${p.padding.y}px` : '0'} ${(p) => p.padding?.x ? `${p.padding.x}px` : '3px'} !important;
        font-family: ${(p) => p.fontStyles?.fontFamily} !important;
        font-weight: ${(p) => p.fontStyles?.fontWeight} !important;
        text-align: ${(p) => p.fontStyles?.textAlign} !important;
        ${(p) => p.menuItemStyle || ''}
        ${(p) => p.itemStyle || ''}
        display: flex !important;
        align-items: center !important;

        .${(p) => p.theme.prefixCls}-menu-title-content {
          flex: 1 !important;
          display: flex !important;
          align-items: center !important;
        }

        .anticon {
          margin-right: 10px !important;
          margin-left: 0 !important;
        }

        &:hover {
          color: ${(p) => p.colors?.hoverItemColor || BLACK_CLR};
          ${(p) => p.styleOnHover || ''}
          ${(p) => !p.styleOnHover ? `background: ${p.colors?.hoverItemBackground || 'white'} !important;` : ''}

          .anticon {
            ${(p) => !p.styleOnHover ? `color: ${p.colors?.hoverItemColor || BLACK_CLR};` : ''}
          }

          .${(p) => p.theme.prefixCls}-menu-submenu-arrow {
            ${(p) => !p.styleOnHover ? `color: ${p.colors?.hoverItemColor || BLACK_CLR} !important;` : ''}
          }
        }

        .${(p) => p.theme.prefixCls}-menu-submenu-arrow {
          color: ${(p) => p.colors?.itemColor || BLACK_CLR};
          margin-left: auto !important;
          padding-left: 4px !important;
          position: static !important;
          display: inline-block !important;
          inset: unset !important;
          transform: none !important;
        }
      }

      &.${(p) => p.theme.prefixCls}-menu-submenu-selected {
        .${(p) => p.theme.prefixCls}-menu-submenu-title {
          color: ${(p) => p.colors?.selectedItemColor || BLACK_CLR} !important;
          background: ${(p) => p.colors?.selectedItemBackground || 'white'} !important;
          ${(p) => p.styleOnSelected || ''}
        }
      }
    }

    .${(p) => p.theme.prefixCls}-menu-item-active {
      ${(p) => p.styleOnHover || `
        color: ${p.colors?.hoverItemColor || BLACK_CLR};
        background: ${p.colors?.hoverItemBackground || 'white'};
      `}

      .${(p) => p.theme.prefixCls}-menu-title-content {
        ${(p) => !p.styleOnHover ? `color: ${p.colors?.hoverItemColor || BLACK_CLR};` : ''}
      }

      .anticon {
        ${(p) => !p.styleOnHover ? `color: ${p.colors?.hoverItemColor || BLACK_CLR};` : ''}
      }
    }

    .${(p) => p.theme.prefixCls}-menu-submenu-active {
      /* Removed hover styles from active state - they should only apply on :hover */

      /* When submenu has a selected child */
      &.${(p) => p.theme.prefixCls}-menu-submenu-selected {
        .${(p) => p.theme.prefixCls}-menu-submenu-title {
          color: ${(p) => p.colors?.selectedItemColor || BLACK_CLR} !important;
          background: ${(p) => p.colors?.selectedItemBackground || 'white'} !important;
          ${(p) => p.styleOnSelected || ''}
        }
      }
    }
  }

  /* Drawer menu items - ensure consistent height and padding for all items */
  .horizontal-menu-drawer-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-item,
  .horizontal-menu-drawer-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-submenu .${(p) => p.theme.prefixCls}-menu-submenu-title {
    height: 40px !important;
    line-height: 40px !important;
  }

  /* Ensure regular items match submenu title padding */
  .horizontal-menu-drawer-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-item {
    padding: ${(p) => p.padding?.y ? `${p.padding.y}px` : '0'} ${(p) => p.padding?.x ? `${p.padding.x}px` : '3px'} !important;
  }

  /* Drawer submenu items - use subItem colors */
  .horizontal-menu-drawer-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-sub .${(p) => p.theme.prefixCls}-menu-item {
    color: ${(p) => p.colors?.subItemColor || BLACK_CLR} !important;
    ${(p) => p.colors?.subItemBackground ? `background: ${p.colors?.subItemBackground} !important;` : ''}
    ${(p) => p.styleOnSubMenu || ''};
  }

  .horizontal-menu-drawer-${(p) => p.menuId} .${(p) => p.theme.prefixCls}-menu-sub .${(p) => p.theme.prefixCls}-menu-submenu-title {
    color: ${(p) => p.colors?.subItemColor || BLACK_CLR} !important;
    ${(p) => p.colors?.subItemBackground ? `background: ${p.colors?.subItemBackground} !important;` : ''}
    ${(p) => p.styleOnSubMenu || ''};
  }
`;
