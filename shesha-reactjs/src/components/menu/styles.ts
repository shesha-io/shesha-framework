import { createGlobalStyle, createStyles } from "antd-style";
import { ILayoutColor } from "./model";
import { NamedExoticComponent } from "react";
import { GlobalTheme } from "antd-style/lib/factories/createGlobalStyle";

interface IStyleProps {
  colors: ILayoutColor;
  fontSize?: string;
  isScrolling: boolean;
  padding?: { x: number; y: number };
  itemStyle?: string;
  styleOnHover?: string;
  styleOnSelected?: string;
  menuItemStyle?: string;
  width: string;
  fontStyles?: React.CSSProperties;
}

interface IGlobalMenuProps {
  colors: ILayoutColor;
  padding?: { x: number; y: number };
  itemStyle?: string;
  styleOnHover?: string;
  styleOnSelected?: string;
  styleOnSubMenu?: string;
  menuItemStyle?: string;
  fontStyles?: React.CSSProperties;
  menuId?: string;
}

type GlobalMenuType = IGlobalMenuProps | GlobalTheme | any;

const BLACK_CLR = "#000000e0";

export const useStyles = createStyles(
  (
    { css, cx, prefixCls },
    {
      colors,
      fontSize,
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
      align-items: ${isScrolling ? 'stretch' : 'center'};
      height: auto;
      min-height: 100%;
      width: ${width};
      padding: ${isScrolling ? '0' : '2px 0'};
      overflow: visible !important;
    `;

    const menuWrapper = css`
      flex-direction: row;
      white-space: nowrap;
      align-items: center;
      scroll-behavior: smooth;
      scrollbar-width: none;
      overflow-y: visible !important;
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
        overflow-y: visible !important;
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
        overflow: visible !important;

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
          ${itemStyle
            ? `padding: ${padding?.y ? `${Math.max(0, padding.y - 1)}px` : '0'} ${padding?.x ? `${padding.x}px` : '3px'} !important;`
            : `padding: ${padding?.y ? `${padding.y}px` : '0'} ${padding?.x ? `${padding.x}px` : '3px'} !important;`
          }
          ${!itemStyle ? `color: ${colors?.itemColor ?? BLACK_CLR} !important;` : `color: ${colors?.itemColor ?? BLACK_CLR};`}
          ${!itemStyle ? (colors?.itemBackground ? `background: ${colors.itemBackground} !important;` : 'background: transparent !important;') : (colors?.itemBackground ? `background: ${colors.itemBackground};` : 'background: transparent;')}
          margin-right: 0;
          margin-bottom: 0;
          font-family: ${fontStyles?.fontFamily};
          font-size: ${fontSize ? `${fontSize}px` : fontStyles?.fontSize};
          font-weight: ${fontStyles?.fontWeight};
          border-radius: 0;
          box-sizing: border-box;
          ${menuItemStyle || ''}
          ${itemStyle || ''}

          .anticon {
            margin-left: 10px;
            color: ${itemStyle ? 'inherit' : 'currentColor'};
          }
        }

        /* Only apply to top-level submenus */
        &.${prefixCls}-menu-horizontal > .${prefixCls}-menu-submenu {
          padding: 0 !important;
          overflow: visible !important;
          border-radius: 0;
          height: auto;

          > .${prefixCls}-menu-submenu-title {
            color: ${colors?.itemColor ?? BLACK_CLR};
            ${colors?.itemBackground ? `background: ${colors.itemBackground};` : 'background: transparent;'}
            font-family: ${fontStyles?.fontFamily};
            font-size: ${fontSize ? `${fontSize}px` : fontStyles?.fontSize};
            font-weight: ${fontStyles?.fontWeight};
            display: flex !important;
            align-items: center !important;
            ${itemStyle
              ? `padding: ${padding?.y ? `${Math.max(0, padding.y - 1)}px` : '0'} ${padding?.x ? `${padding.x}px` : '3px'} !important;`
              : `padding: ${padding?.y ? `${padding.y}px` : '0'} ${padding?.x ? `${padding.x}px` : '3px'} !important;`
            }
            margin-bottom: 0;
            border-radius: 0;
            box-sizing: border-box;
            ${menuItemStyle || ''}
            ${itemStyle || ''}

            .${prefixCls}-menu-title-content {
              flex: 1 !important;
              display: flex !important;
              align-items: center !important;
            }

            .${prefixCls}-icon {
              font-size: ${fontSize ? `${fontSize}px` : fontStyles?.fontSize};
              color: ${itemStyle ? 'inherit' : `${colors?.itemColor ?? BLACK_CLR}`};
              margin-left: 10px;

              &:hover {
                ${styleOnHover || ''}
                ${!styleOnHover ? `color: ${colors?.hoverItemColor || BLACK_CLR};` : ''}
              }
            }

            .anticon {
              margin-left: 10px;
              color: ${itemStyle ? 'inherit' : 'currentColor'};
            }

            .${prefixCls}-menu-submenu-arrow {
              margin-left: auto !important;
              padding-left: 4px !important;
              position: static !important;
              display: inline-block !important;
              inset: unset !important;
              transform: none !important;
              color: ${itemStyle ? 'inherit' : `${colors?.itemColor ?? BLACK_CLR}`} !important;
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

    // Ant Design horizontal menu items have a base height of 40px + padding
    // Adjusted to 48px to match actual rendered height
    const menuItemHeight = `calc(48px + ${padding?.y ? `${padding.y * 2}px` : '0px'})`;

    const scrollButtons = css`
      width: 80px;
      display: flex;
      height: ${menuItemHeight};
      color: ${colors?.itemColor};
      ${colors?.itemBackground ? `background: ${colors.itemBackground};` : ''}
      flex-direction: row;
      justify-content: center;
      align-items: center;
      align-self: center;
      margin: 0;
      padding: 0;
      gap: 0;
    `;

    const scrollButton = css`
      cursor: pointer;
      padding: 0 5px;
      margin: 0;
      transition: background 0.3s;
      width: 45%;
      align-items: center;
      height: 100%;
      justify-content: center;
      display: flex;
      color: ${itemStyle ? 'inherit' : `${colors?.itemColor || BLACK_CLR}`};
      ${colors?.itemBackground ? `background: ${colors.itemBackground};` : ''}
      ${menuItemStyle || ''}
      ${itemStyle || ''}

      &:hover {
        background: ${colors?.hoverItemBackground
          ? `${colors.hoverItemBackground}`
          : "#e8e8e8"};
        color: ${colors?.hoverItemColor || BLACK_CLR};
        z-index: 1;

        ${styleOnHover}
      }
    `;

    return {
      menuContainer,
      menuWrapper,
      menuWrapperScroll,
      shaMenu,
      shaHamburgerItem,
      scrollButtons,
      scrollButton,
    };
  },
);

export const GlobalMenuStyles: NamedExoticComponent<IGlobalMenuProps> = createGlobalStyle`
  /* Allow borders to extend beyond container without adding height */
  .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu.${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-horizontal {
    overflow: visible;
  }

  /* Enable text overflow with ellipsis for all menu items */
  .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-title-content {
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }

  /* Standardize dropdown widths globally */
  .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-popup .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu {
    min-width: 200px !important;
    max-width: 400px !important;
    width: 200px !important;
  }

  /* Show arrows for horizontal menu items with children */
  .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-horizontal > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-title .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-arrow {
    display: inline-block !important;
  }

  .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub,
  .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-inline,
  .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu {

    border: none !important;
    box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05) !important;
    font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
    font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
    text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;

    .${(p) => p?.theme.prefixCls}-menu-submenu-arrow {
      display: none !important;
    }

    .${(p) => p?.theme.prefixCls}-menu-item {
      color: ${(p: GlobalMenuType) => p?.colors?.subItemColor || p?.colors?.itemColor || BLACK_CLR};
      ${(p: GlobalMenuType) => p?.colors?.subItemBackground ? `background: ${p.colors.subItemBackground};` : ''}
      font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
      font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
      text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;
      ${(p: GlobalMenuType) => p?.menuItemStyle || ''}
      ${(p: GlobalMenuType) => p?.styleOnSubMenu || ''}

      .anticon {
        margin-right: 10px !important;
        margin-left: 0 !important;
      }

      &:hover {
        color: ${(p: GlobalMenuType) => p?.colors?.hoverItemColor || BLACK_CLR};
        background: ${(p: GlobalMenuType) => p?.colors?.hoverItemBackground || 'white'} !important;
        ${(p: GlobalMenuType) => p?.styleOnHover || ''}

        .anticon {
          ${(p: GlobalMenuType) => !p?.styleOnHover ? `color: ${p?.colors?.hoverItemColor || BLACK_CLR};` : ''}
        }
      }

      &.${(p) => p?.theme.prefixCls}-menu-item-selected {
        color: ${(p: GlobalMenuType) => p?.colors?.selectedItemColor || BLACK_CLR} !important;
        background: ${(p: GlobalMenuType) => p?.colors?.selectedItemBackground || 'white'} !important;
        ${(p: GlobalMenuType) => p?.styleOnSelected || ''}
      }
    }

    /* Parent submenu items (items that have children) */
    .${(p) => p?.theme.prefixCls}-menu-submenu {
      padding: 0 !important;
      border-radius: 0 !important;

      .${(p) => p?.theme.prefixCls}-menu-submenu-title {
        color: ${(p: GlobalMenuType) => p?.colors?.subItemColor || p?.colors?.itemColor || BLACK_CLR};
        ${(p: GlobalMenuType) => p?.colors?.subItemBackground ? `background: ${p.colors.subItemBackground};` : ''}
        border-radius: 0 !important;
        font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
        font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
        text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;
        ${(p: GlobalMenuType) => p?.menuItemStyle || ''}
        ${(p: GlobalMenuType) => p?.styleOnSubMenu || ''}
        display: flex !important;
        align-items: center !important;

        .${(p) => p?.theme.prefixCls}-menu-title-content {
          flex: 1 !important;
          display: flex !important;
          align-items: center !important;
        }

        .anticon {
          margin-right: 10px !important;
          margin-left: 0 !important;
          color: ${(p: GlobalMenuType) => p?.styleOnSubMenu ? 'inherit' : 'currentColor'};
        }

        .${(p) => p?.theme.prefixCls}-menu-submenu-arrow {
          color: ${(p: GlobalMenuType) => p?.styleOnSubMenu ? 'inherit' : (p?.colors?.subItemColor || p?.colors?.itemColor || BLACK_CLR)};
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
        .${(p) => p?.theme.prefixCls}-menu-submenu-title {
          color: ${(p: GlobalMenuType) => p?.colors?.hoverItemColor || BLACK_CLR};
          background: ${(p: GlobalMenuType) => p?.colors?.hoverItemBackground || 'white'} !important;
          ${(p: GlobalMenuType) => p?.styleOnHover || ''}

          .anticon {
            ${(p: GlobalMenuType) => !p?.styleOnHover ? `color: ${p?.colors?.hoverItemColor || BLACK_CLR};` : ''}
          }

          .${(p) => p?.theme.prefixCls}-menu-submenu-arrow {
            ${(p: GlobalMenuType) => !p?.styleOnHover ? `color: ${p?.colors?.hoverItemColor || BLACK_CLR} !important;` : ''}
          }
        }
      }

      &.${(p) => p?.theme.prefixCls}-menu-submenu-selected {
        .${(p) => p?.theme.prefixCls}-menu-submenu-title {
          color: ${(p: GlobalMenuType) => p?.colors?.selectedItemColor || BLACK_CLR} !important;
          background: ${(p: GlobalMenuType) => p?.colors?.selectedItemBackground || 'white'} !important;
          ${(p: GlobalMenuType) => p?.styleOnSelected || ''}
        }
      }
    }

    .${(p) => p?.theme.prefixCls}-menu-item-active {
      ${(p: GlobalMenuType) => p?.styleOnHover || `
        color: ${p?.colors?.hoverItemColor || BLACK_CLR};
        background: ${p?.colors?.hoverItemBackground || 'white'};
      `}

      .${(p) => p?.theme.prefixCls}-menu-title-content {
        ${(p: GlobalMenuType) => !p?.styleOnHover ? `color: ${p?.colors?.hoverItemColor || BLACK_CLR};` : ''}
      }

      .anticon {
        ${(p: GlobalMenuType) => !p?.styleOnHover ? `color: ${p?.colors?.hoverItemColor || BLACK_CLR};` : ''}
      }
    }

    .${(p) => p?.theme.prefixCls}-menu-submenu-active {
      /* Removed hover styles from active state - they should only apply on :hover */

      /* When submenu has a selected child */
      &.${(p) => p?.theme.prefixCls}-menu-submenu-selected {
        .${(p) => p?.theme.prefixCls}-menu-submenu-title {
          color: ${(p: GlobalMenuType) => p?.colors?.selectedItemColor || BLACK_CLR} !important;
          background: ${(p: GlobalMenuType) => p?.colors?.selectedItemBackground || 'white'} !important;
          ${(p: GlobalMenuType) => p?.styleOnSelected || ''}
        }
      }
    }
  }

  /* Drawer menu items - ensure consistent height and padding for all items */
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-item,
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-title {
    height: 40px !important;
    line-height: 40px !important;
  }

  /* Top-level drawer menu items - apply itemStyle */
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} > .${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer-body > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu.${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-inline > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-item {
    padding: ${(p: GlobalMenuType) => p?.padding?.y ? `${p.padding.y}px` : '0'} ${(p: GlobalMenuType) => p?.padding?.x ? `${p.padding.x}px` : '3px'} !important;
    height: 40px !important;
    line-height: 40px !important;
    color: ${(p: GlobalMenuType) => p?.colors?.itemColor || BLACK_CLR};
    ${(p: GlobalMenuType) => p?.colors?.itemBackground ? `background: ${p.colors.itemBackground};` : ''}
    ${(p: GlobalMenuType) => p?.itemStyle || ''}

    .anticon {
      color: ${(p: GlobalMenuType) => p?.itemStyle ? 'inherit' : 'currentColor'};
    }
  }

  /* Top-level drawer submenu titles - apply itemStyle */
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} > .${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer-body > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu.${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-inline > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-title {
    padding: ${(p: GlobalMenuType) => p?.padding?.y ? `${p.padding.y}px` : '0'} ${(p: GlobalMenuType) => p?.padding?.x ? `${p.padding.x}px` : '3px'} !important;
    height: 40px !important;
    line-height: 40px !important;
    color: ${(p: GlobalMenuType) => p?.colors?.itemColor || BLACK_CLR};
    ${(p: GlobalMenuType) => p?.colors?.itemBackground ? `background: ${p.colors.itemBackground};` : ''}
    ${(p: GlobalMenuType) => p?.itemStyle || ''}

    .anticon {
      color: ${(p: GlobalMenuType) => p?.itemStyle ? 'inherit' : 'currentColor'};
    }

    .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-arrow {
      color: ${(p: GlobalMenuType) => p?.itemStyle ? 'inherit' : (p?.colors?.itemColor || BLACK_CLR)};
    }
  }

  /* Drawer submenu items - use subItem colors and reset itemStyle properties */
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-item {
    color: ${(p: GlobalMenuType) => p?.colors?.subItemColor || p?.colors?.itemColor || BLACK_CLR} !important;
    ${(p: GlobalMenuType) => p?.colors?.subItemBackground ? `background: ${p?.colors?.subItemBackground} !important;` : ''}
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    ${(p: GlobalMenuType) => p?.styleOnSubMenu || ''};

    .anticon {
      color: ${(p: GlobalMenuType) => p?.styleOnSubMenu ? 'inherit' : `${p?.colors?.subItemColor || p?.colors?.itemColor || BLACK_CLR}`} !important;
    }

    &:hover {
      color: ${(p: GlobalMenuType) => p?.colors?.hoverItemColor || BLACK_CLR} !important;
      background: ${(p: GlobalMenuType) => p?.colors?.hoverItemBackground || 'white'} !important;
      ${(p: GlobalMenuType) => p?.styleOnHover || ''};

      .anticon {
        ${(p: GlobalMenuType) => !p?.styleOnHover ? `color: ${p?.colors?.hoverItemColor || BLACK_CLR} !important;` : ''}
      }
    }

    &.${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-item-selected {
      color: ${(p: GlobalMenuType) => p?.colors?.selectedItemColor || BLACK_CLR} !important;
      background: ${(p: GlobalMenuType) => p?.colors?.selectedItemBackground || 'white'} !important;
      ${(p: GlobalMenuType) => p?.styleOnSelected || ''};
    }
  }

  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-title {
    color: ${(p: GlobalMenuType) => p?.colors?.subItemColor || p?.colors?.itemColor || BLACK_CLR} !important;
    ${(p: GlobalMenuType) => p?.colors?.subItemBackground ? `background: ${p?.colors?.subItemBackground} !important;` : ''}
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    ${(p: GlobalMenuType) => p?.styleOnSubMenu || ''};

    .anticon {
      color: ${(p: GlobalMenuType) => p?.styleOnSubMenu ? 'inherit' : `${p?.colors?.subItemColor || p?.colors?.itemColor || BLACK_CLR}`} !important;
    }

    .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-arrow {
      color: ${(p: GlobalMenuType) => p?.styleOnSubMenu ? 'inherit' : `${p?.colors?.subItemColor || p?.colors?.itemColor || BLACK_CLR}`} !important;
    }

    &:hover {
      color: ${(p: GlobalMenuType) => p?.colors?.hoverItemColor || BLACK_CLR} !important;
      background: ${(p: GlobalMenuType) => p?.colors?.hoverItemBackground || 'white'} !important;
      ${(p: GlobalMenuType) => p?.styleOnHover || ''};

      .anticon {
        ${(p: GlobalMenuType) => !p?.styleOnHover ? `color: ${p?.colors?.hoverItemColor || BLACK_CLR} !important;` : ''}
      }

      .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-arrow {
        ${(p: GlobalMenuType) => !p?.styleOnHover ? `color: ${p?.colors?.hoverItemColor || BLACK_CLR} !important;` : ''}
      }
    }
  }

  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId}
    .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub
    .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu.${(p: GlobalMenuType) =>
      p?.theme.prefixCls}-menu-submenu-selected
    .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-title {
    color: ${(p: GlobalMenuType) => p?.colors?.selectedItemColor || BLACK_CLR} !important;
    background: ${(p: GlobalMenuType) => p?.colors?.selectedItemBackground || 'white'} !important;
    ${(p: GlobalMenuType) => p?.styleOnSelected || ''};
  }
`;

export const ScopedMenuStyles: NamedExoticComponent<IGlobalMenuProps> = createGlobalStyle`
  /* Allow borders to extend beyond container without adding height for scoped menus */
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId}.${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-horizontal {
    overflow: visible;
  }

  /* Enable text overflow with ellipsis for all menu items in scoped menus */
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-title-content,
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-title-content {
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }

  /* Standardize dropdown widths for scoped horizontal menus */
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId}-dropdown.${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-popup .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu {
    min-width: 200px !important;
    max-width: 400px !important;
    width: 200px !important;
  }

  /* Show arrows for horizontal menu items with children */
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId}.${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-horizontal
    > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu
    > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-title
    .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-arrow {
    display: inline-block !important;
  }

  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId}.${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer {
    .${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer-content-wrapper,
    .${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer-content {
    }
    .${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer-header {
      color: ${(p: GlobalMenuType) => p?.colors?.itemColor || BLACK_CLR};
      font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
      font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
      text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;
      border-bottom: none !important;

      .${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer-title {
        color: ${(p: GlobalMenuType) => p?.colors?.itemColor || BLACK_CLR};
        font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
        font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
        text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;
      }
    }

    .${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer-body {
      padding: 0 !important;
    }
  }

  /* Submenu container styles for drawer */
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub {
    border: none !important;
    font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
    font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
    text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;
  }

  /* Override Ant Design's default grey background on inline submenus */
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-inline .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub.${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-inline {
    background: ${(p: GlobalMenuType) => p?.colors?.subItemBackground || 'white'} !important;
  }

  /* Submenu container styles for horizontal menu dropdowns */
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub,
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-inline,
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu {
    border: none !important;
    font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
    font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
    text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;
  }

  /* Hide submenu arrows only for horizontal menu (not drawer) */
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub,
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-inline,
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu {
    .${(p) => p?.theme.prefixCls}-menu-submenu-arrow {
      display: none !important;
    }
  }

  /* Show submenu arrows for drawer menu */
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId}.${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer .${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer-body .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub,
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub,
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-inline,
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu,
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId}-menu.${(p: GlobalMenuType) => p?.theme.prefixCls}-menu .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub,
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer-body .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub {
    .${(p) => p?.theme.prefixCls}-menu-submenu-arrow {
      display: inline-block !important;
    }
  }

  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId}.${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer .${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer-body .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub,
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId}.${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer .${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer-body .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub,
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub,
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-inline,
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu,

  /* Horizontal menu container - ensure overflow visible */
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId}.${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-horizontal {
    overflow: visible !important;
  }

  /* Top-level horizontal menu items - apply itemStyle */
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId}.${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-horizontal > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-item {
    ${(p: GlobalMenuType) => !p?.itemStyle ? `color: ${p?.colors?.itemColor || BLACK_CLR} !important;` : `color: ${p?.colors?.itemColor || BLACK_CLR};`}
    ${(p: GlobalMenuType) => !p?.itemStyle ? (p?.colors?.itemBackground ? `background: ${p.colors.itemBackground} !important;` : 'background: transparent !important;') : (p?.colors?.itemBackground ? `background: ${p.colors.itemBackground};` : 'background: transparent;')}
    font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
    font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
    text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;
    ${(p: GlobalMenuType) => p?.itemStyle
      ? `padding: ${p?.padding?.y ? `${Math.max(0, p.padding.y - 1)}px` : '0'} ${p?.padding?.x ? `${p.padding.x}px` : '3px'} !important;`
      : `padding: ${p?.padding?.y ? `${p.padding.y}px` : '0'} ${p?.padding?.x ? `${p.padding.x}px` : '3px'} !important;`
    }
    margin-bottom: 0;
    border-radius: 0;
    box-sizing: border-box;
    ${(p: GlobalMenuType) => p?.menuItemStyle || ''}
    ${(p: GlobalMenuType) => p?.itemStyle || ''}

    .anticon {
      margin-right: 10px !important;
      margin-left: 0 !important;
    }

    &:hover {
      color: ${(p: GlobalMenuType) => p?.colors?.hoverItemColor || BLACK_CLR};
      background: ${(p: GlobalMenuType) => p?.colors?.hoverItemBackground || 'white'} !important;
      ${(p: GlobalMenuType) => p?.styleOnHover || ''}

      .anticon {
        ${(p: GlobalMenuType) => !p?.styleOnHover ? `color: ${p?.colors?.hoverItemColor || BLACK_CLR};` : ''}
      }
    }

    &.${(p) => p?.theme.prefixCls}-menu-item-selected {
      ${(p: GlobalMenuType) => p?.styleOnSelected || `
        color: ${p?.colors.selectedItemColor || BLACK_CLR} !important;
        background: ${p?.colors?.selectedItemBackground || 'white'} !important;
      `}
    }
  }

  /* Top-level horizontal menu submenus - ensure overflow visible */
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId}.${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-horizontal > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu {
    overflow: visible !important;
    height: auto;
    padding: 0 !important;
    border-radius: 0;
  }

  /* Top-level horizontal menu submenu titles - apply itemStyle */
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId}.${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-horizontal > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-title {
    color: ${(p: GlobalMenuType) => p?.colors?.itemColor || BLACK_CLR};
    ${(p: GlobalMenuType) => p?.colors?.itemBackground ? `background: ${p.colors.itemBackground};` : 'background: transparent;'}
    font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
    font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
    text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;
    ${(p: GlobalMenuType) => p?.itemStyle
      ? `padding: ${p?.padding?.y ? `${Math.max(0, p.padding.y - 1)}px` : '0'} ${p?.padding?.x ? `${p.padding.x}px` : '3px'} !important;`
      : `padding: ${p?.padding?.y ? `${p.padding.y}px` : '0'} ${p?.padding?.x ? `${p.padding.x}px` : '3px'} !important;`
    }
    margin-bottom: 0;
    border-radius: 0;
    box-sizing: border-box;
    ${(p: GlobalMenuType) => p?.menuItemStyle || ''}
    ${(p: GlobalMenuType) => p?.itemStyle || ''}

    .anticon {
      margin-right: 10px !important;
      margin-left: 0 !important;
      color: ${(p: GlobalMenuType) => p?.itemStyle ? 'inherit' : 'currentColor'};
    }

    .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-arrow {
      color: ${(p: GlobalMenuType) => p?.itemStyle ? 'inherit' : (p?.colors?.itemColor || BLACK_CLR)};
    }
  }

  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId}.${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-horizontal > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu:hover > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-title {
    color: ${(p: GlobalMenuType) => p?.colors?.hoverItemColor || BLACK_CLR};
    background: ${(p: GlobalMenuType) => p?.colors?.hoverItemBackground || 'white'} !important;
    ${(p: GlobalMenuType) => p?.styleOnHover || ''}

    .anticon {
      ${(p: GlobalMenuType) => !p?.styleOnHover ? `color: ${p?.colors?.hoverItemColor || BLACK_CLR};` : ''}
    }

    .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-arrow {
      ${(p: GlobalMenuType) => !p?.styleOnHover ? `color: ${p?.colors?.hoverItemColor || BLACK_CLR};` : ''}
    }
  }

  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId}.${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-horizontal > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu.${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-selected > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-title {
    color: ${(p: GlobalMenuType) => p?.colors?.selectedItemColor || BLACK_CLR} !important;
    background: ${(p: GlobalMenuType) => p?.colors?.selectedItemBackground || 'white'} !important;
    ${(p: GlobalMenuType) => p?.styleOnSelected || ''}
  }

  /* Dropdown submenu items - apply styleOnSubMenu */
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub,
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-inline {

    .${(p) => p?.theme.prefixCls}-menu-item {
      color: ${(p: GlobalMenuType) => p?.colors?.subItemColor || p?.colors?.itemColor || BLACK_CLR};
      ${(p: GlobalMenuType) => p?.colors?.subItemBackground ? `background: ${p.colors.subItemBackground};` : ''}
      font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
      font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
      text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;
      ${(p: GlobalMenuType) => p?.menuItemStyle || ''}
      ${(p: GlobalMenuType) => p?.styleOnSubMenu || ''}

      .anticon {
        margin-right: 10px !important;
        margin-left: 0 !important;
      }

      &:hover {
        color: ${(p: GlobalMenuType) => p?.colors?.hoverItemColor || BLACK_CLR};
        background: ${(p: GlobalMenuType) => p?.colors?.hoverItemBackground || 'white'} !important;
        ${(p: GlobalMenuType) => p?.styleOnHover || ''}

        .anticon {
          ${(p: GlobalMenuType) => !p?.styleOnHover ? `color: ${p?.colors?.hoverItemColor || BLACK_CLR};` : ''}
        }
      }

      &.${(p) => p?.theme.prefixCls}-menu-item-selected {
        ${(p: GlobalMenuType) => p?.styleOnSelected || `
          color: ${p?.colors.selectedItemColor || BLACK_CLR} !important;
          background: ${p?.colors?.selectedItemBackground || 'white'} !important;
        `}
      }
    }

    /* Nested submenu titles in dropdowns - apply styleOnSubMenu */
    .${(p) => p?.theme.prefixCls}-menu-submenu {
      .${(p) => p?.theme.prefixCls}-menu-submenu-title {
        color: ${(p: GlobalMenuType) => p?.colors?.subItemColor || p?.colors?.itemColor || BLACK_CLR};
        ${(p: GlobalMenuType) => p?.colors?.subItemBackground ? `background: ${p.colors.subItemBackground};` : ''}
        padding: ${(p: GlobalMenuType) => p?.padding?.y ? `${p.padding.y}px` : '0'} ${(p: GlobalMenuType) => p?.padding?.x ? `${p.padding.x}px` : '3px'} !important;
        font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
        font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
        text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;
        ${(p: GlobalMenuType) => p?.menuItemStyle || ''}
        ${(p: GlobalMenuType) => p?.styleOnSubMenu || ''}
        display: flex !important;
        align-items: center !important;

        .${(p) => p?.theme.prefixCls}-menu-title-content {
          flex: 1 !important;
          display: flex !important;
          align-items: center !important;
        }

        .anticon {
          margin-right: 10px !important;
          margin-left: 0 !important;
          color: ${(p: GlobalMenuType) => p?.styleOnSubMenu ? 'inherit' : 'currentColor'};
        }

        &:hover {
          color: ${(p: GlobalMenuType) => p?.colors?.hoverItemColor || BLACK_CLR};
          ${(p: GlobalMenuType) => p?.styleOnHover || ''}
          ${(p: GlobalMenuType) => !p?.styleOnHover ? `background: ${p?.colors?.hoverItemBackground || 'white'} !important;` : ''}

          .anticon {
            ${(p: GlobalMenuType) => !p?.styleOnHover ? `color: ${p?.colors?.hoverItemColor || BLACK_CLR};` : ''}
          }

          .${(p) => p?.theme.prefixCls}-menu-submenu-arrow {
            ${(p: GlobalMenuType) => !p?.styleOnHover ? `color: ${p?.colors?.hoverItemColor || BLACK_CLR} !important;` : ''}
          }
        }

        .${(p) => p?.theme.prefixCls}-menu-submenu-arrow {
          color: ${(p: GlobalMenuType) => p?.styleOnSubMenu ? 'inherit' : (p?.colors?.subItemColor || p?.colors?.itemColor || BLACK_CLR)};
          margin-left: auto !important;
          padding-left: 4px !important;
          position: static !important;
          display: inline-block !important;
          inset: unset !important;
          transform: none !important;
        }
      }

      &.${(p) => p?.theme.prefixCls}-menu-submenu-selected {
        .${(p) => p?.theme.prefixCls}-menu-submenu-title {
          color: ${(p: GlobalMenuType) => p?.colors?.selectedItemColor || BLACK_CLR} !important;
          background: ${(p: GlobalMenuType) => p?.colors?.selectedItemBackground || 'white'} !important;
          ${(p: GlobalMenuType) => p?.styleOnSelected || ''}
        }
      }
    }

    .${(p) => p?.theme.prefixCls}-menu-item-active {
      ${(p: GlobalMenuType) => p?.styleOnHover || `
        color: ${p?.colors?.hoverItemColor || BLACK_CLR};
        background: ${p?.colors?.hoverItemBackground || 'white'};
      `}

      .${(p) => p?.theme.prefixCls}-menu-title-content {
        ${(p: GlobalMenuType) => !p?.styleOnHover ? `color: ${p?.colors?.hoverItemColor || BLACK_CLR};` : ''}
      }

      .anticon {
        ${(p: GlobalMenuType) => !p?.styleOnHover ? `color: ${p?.colors?.hoverItemColor || BLACK_CLR};` : ''}
      }
    }

    .${(p) => p?.theme.prefixCls}-menu-submenu-active {
      /* Removed hover styles from active state - they should only apply on :hover */

      /* When submenu has a selected child */
      &.${(p) => p?.theme.prefixCls}-menu-submenu-selected {
        .${(p) => p?.theme.prefixCls}-menu-submenu-title {
          color: ${(p: GlobalMenuType) => p?.colors?.selectedItemColor || BLACK_CLR} !important;
          background: ${(p: GlobalMenuType) => p?.colors?.selectedItemBackground || 'white'} !important;
          ${(p: GlobalMenuType) => p?.styleOnSelected || ''}
        }
      }
    }
  }

  /* Drawer menu items - ensure consistent height and padding for all items */
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-item,
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-title {
    height: 40px !important;
    line-height: 40px !important;
  }

  /* Top-level drawer menu items - apply itemStyle */
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} > .${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer-body > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu.${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-inline > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-item {
    padding: ${(p: GlobalMenuType) => p?.padding?.y ? `${p.padding.y}px` : '0'} ${(p: GlobalMenuType) => p?.padding?.x ? `${p.padding.x}px` : '3px'} !important;
    height: 40px !important;
    line-height: 40px !important;
    color: ${(p: GlobalMenuType) => p?.colors?.itemColor || BLACK_CLR};
    ${(p: GlobalMenuType) => p?.colors?.itemBackground ? `background: ${p.colors.itemBackground};` : ''}
    ${(p: GlobalMenuType) => p?.itemStyle || ''}

    .anticon {
      color: ${(p: GlobalMenuType) => p?.itemStyle ? 'inherit' : 'currentColor'};
    }
  }

  /* Top-level drawer submenu titles - apply itemStyle */
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} > .${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer-body > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu.${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-inline > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-title {
    padding: ${(p: GlobalMenuType) => p?.padding?.y ? `${p.padding.y}px` : '0'} ${(p: GlobalMenuType) => p?.padding?.x ? `${p.padding.x}px` : '3px'} !important;
    height: 40px !important;
    line-height: 40px !important;
    color: ${(p: GlobalMenuType) => p?.colors?.itemColor || BLACK_CLR};
    ${(p: GlobalMenuType) => p?.colors?.itemBackground ? `background: ${p.colors.itemBackground};` : ''}
    ${(p: GlobalMenuType) => p?.itemStyle || ''}

    .anticon {
      color: ${(p: GlobalMenuType) => p?.itemStyle ? 'inherit' : 'currentColor'};
    }

    .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-arrow {
      color: ${(p: GlobalMenuType) => p?.itemStyle ? 'inherit' : (p?.colors?.itemColor || BLACK_CLR)};
    }
  }

  /* Drawer submenu items - use subItem colors and reset itemStyle properties */
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-item {
    color: ${(p: GlobalMenuType) => p?.colors?.subItemColor || p?.colors?.itemColor || BLACK_CLR} !important;
    ${(p: GlobalMenuType) => p?.colors?.subItemBackground ? `background: ${p?.colors?.subItemBackground} !important;` : ''}
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    ${(p: GlobalMenuType) => p?.styleOnSubMenu || ''};

    .anticon {
      color: ${(p: GlobalMenuType) => p?.styleOnSubMenu ? 'inherit' : `${p?.colors?.subItemColor || p?.colors?.itemColor || BLACK_CLR}`} !important;
    }
  }

  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-title {
    color: ${(p: GlobalMenuType) => p?.colors?.subItemColor || p?.colors?.itemColor || BLACK_CLR} !important;
    ${(p: GlobalMenuType) => p?.colors?.subItemBackground ? `background: ${p?.colors?.subItemBackground} !important;` : ''}
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    ${(p: GlobalMenuType) => p?.styleOnSubMenu || ''};

    .anticon {
      color: ${(p: GlobalMenuType) => p?.styleOnSubMenu ? 'inherit' : `${p?.colors?.subItemColor || p?.colors?.itemColor || BLACK_CLR}`} !important;
    }

    .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-arrow {
      color: ${(p: GlobalMenuType) => p?.styleOnSubMenu ? 'inherit' : `${p?.colors?.subItemColor || p?.colors?.itemColor || BLACK_CLR}`} !important;
    }
  }
`;
