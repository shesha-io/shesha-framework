import { createGlobalStyle, createStyles } from "antd-style";
import { ILayoutColor } from "./model";
import { NamedExoticComponent } from "react";
import { GlobalTheme } from "antd-style/lib/factories/createGlobalStyle";

interface IStyleProps {
  colors: ILayoutColor;
  fontSize?: string;
  isScrolling: boolean;
  padding?: { x: string; y: string };
  itemStyle?: string;
  styleOnHover?: string;
  styleOnSelected?: string;
  menuItemStyle?: string;
  width: string;
  fontStyles?: React.CSSProperties;
}

interface IGlobalMenuProps {
  colors: ILayoutColor;
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
      align-items: center;
      height: 100%;
      width: ${width};
      overflow: hidden;
    `;

    const menuWrapper = css`
      flex-direction: row;
      white-space: nowrap;
      align-items: center;
      scroll-behavior: smooth;
      scrollbar-width: none;

      ::-webkit-scrollbar {
        display: none;
      }
    `;

    const menuWrapperScroll = isScrolling
      ? {
        display: "flex",
        width: `calc(${width} + 80px)`,
        overflow: "scroll",
      }
      : undefined;

    const shaMenu = cx(
      `.${prefixCls}-menu`,
      css`
        border: none;
        width: ${width};
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
          padding: 0 3px !important;
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

        .${prefixCls}-menu-submenu {
          padding: 0 1px !important;

          .${prefixCls}-menu-submenu-title {
            color: ${colors?.itemColor ?? BLACK_CLR};
            font-family: ${fontStyles?.fontFamily};
            font-size: ${fontSize ? `${fontSize}px` : fontStyles?.fontSize};
            font-weight: ${fontStyles?.fontWeight};
            ${itemStyle || ''}
            display: flex !important;
            align-items: center !important;
            padding: 0 3px !important;

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
                ${!styleOnHover && colors?.hoverItemColor ? `color: ${colors.hoverItemColor};` : ''}
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
            }
          }

        }

        /* Apply hover styles specifically to submenu title, not container */
        .${prefixCls}-menu-submenu:hover {
          .${prefixCls}-menu-submenu-title {
            ${styleOnHover || ''}
            ${!styleOnHover && colors?.hoverItemBackground ? `background: ${colors.hoverItemBackground} !important;` : ''}
            ${!styleOnHover && colors?.hoverItemColor ? `color: ${colors.hoverItemColor};` : ''}

            .${prefixCls}-icon,
            .anticon {
              ${styleOnHover || ''}
              ${!styleOnHover && colors?.hoverItemColor ? `color: ${colors.hoverItemColor};` : ''}
            }

            .${prefixCls}-menu-submenu-arrow {
              ${styleOnHover || ''}
              ${!styleOnHover && colors?.hoverItemColor ? `color: ${colors.hoverItemColor} !important;` : ''}
            }
          }
        }

        /* Apply hover styles to regular menu items */
        .${prefixCls}-menu-item:hover {
          ${styleOnHover || ''}
          ${!styleOnHover && colors?.hoverItemBackground ? `background: ${colors.hoverItemBackground} !important;` : ''}
          ${!styleOnHover && colors?.hoverItemColor ? `color: ${colors.hoverItemColor};` : ''}

          .anticon {
            ${styleOnHover || ''}
            ${!styleOnHover && colors?.hoverItemColor ? `color: ${colors.hoverItemColor};` : ''}
          }
        }

        .${prefixCls}-menu-item-active {
          ${styleOnHover || ''}
          ${!styleOnHover && colors?.hoverItemBackground ? `background: ${colors.hoverItemBackground} !important;` : ''}
          ${!styleOnHover && colors?.hoverItemColor ? `color: ${colors.hoverItemColor};` : ''}
        }

        .${prefixCls}-menu-submenu-active {
          /* Removed hover styles from active state - they should only apply on :hover */
        }

        .${prefixCls}-menu-submenu-active.${prefixCls}-menu-submenu-selected {
          background: ${colors?.selectedItemBackground
            ? `${colors.selectedItemBackground} !important`
            : "transparent"};

          .${prefixCls}-menu-submenu-title {
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
            : "transparent"};
          color: ${colors?.selectedItemColor
            ? `${colors.selectedItemColor} !important`
            : BLACK_CLR};
          ${styleOnSelected || ''}
        }

        .${prefixCls}-menu-submenu-selected {
          background: ${colors?.selectedItemBackground
            ? `${colors.selectedItemBackground} !important`
            : "transparent"};

          .${prefixCls}-menu-submenu-title {
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

    const scrollButtons = css`
      width: 80px;
      display: flex;
      height: 100%;
      color: ${colors?.itemColor};
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding-left: 5px;
    `;

    const scrollButton = css`
      cursor: pointer;
      padding: 0 5px;
      transition: background 0.3s;
      width: 45%;
      align-items: center;
      height: 100%;
      justify-content: center;
      display: flex;

      &:hover {
        background: ${colors?.hoverItemBackground
          ? `${colors.hoverItemBackground}`
          : "#e8e8e8"};
        color: ${colors?.hoverItemColor};
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

    ${(p: GlobalMenuType) => p?.styleOnSubMenu};

    border: none !important;
    box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05) !important;
    font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
    font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
    text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;

    .${(p) => p?.theme.prefixCls}-menu-submenu-arrow {
      display: none !important;
    }

    .${(p) => p?.theme.prefixCls}-menu-item {
      color: ${(p: GlobalMenuType) => p?.colors?.itemColor || BLACK_CLR};
      ${(p: GlobalMenuType) => p?.colors?.itemBackground ? `background: ${p.colors.itemBackground};` : ''}
      margin: 0 !important;
      margin-right: 0 !important;
      padding: 0 3px !important;
      font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
      font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
      text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;
      ${(p: GlobalMenuType) => p?.menuItemStyle || ''}
      ${(p: GlobalMenuType) => p?.itemStyle || ''}

      .anticon {
        margin-left: 10px !important;
      }

      &:hover {
        ${(p: GlobalMenuType) => p?.styleOnHover || ''}
        ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemColor ? `color: ${p?.colors?.hoverItemColor};` : ''}
        ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemBackground ? `background: ${p?.colors?.hoverItemBackground} !important;` : ''}

        .anticon {
          ${(p: GlobalMenuType) => p?.styleOnHover || ''}
          ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemColor ? `color: ${p?.colors?.hoverItemColor};` : ''}
        }
      }

      &.${(p) => p?.theme.prefixCls}-menu-item-selected {
        color: ${(p: GlobalMenuType) => p?.colors?.selectedItemColor || BLACK_CLR} !important;
        background: ${(p: GlobalMenuType) => p?.colors?.selectedItemBackground || 'transparent'} !important;
        ${(p: GlobalMenuType) => p?.styleOnSelected || ''}
      }
    }

    /* Parent submenu items (items that have children) */
    .${(p) => p?.theme.prefixCls}-menu-submenu {
      padding: 0 1px !important;

      .${(p) => p?.theme.prefixCls}-menu-submenu-title {
        color: ${(p: GlobalMenuType) => p?.colors?.itemColor || BLACK_CLR};
        ${(p: GlobalMenuType) => p?.colors?.itemBackground ? `background: ${p.colors.itemBackground};` : ''}
        margin: 0 !important;
        margin-right: 0 !important;
        padding: 0 3px !important;
        font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
        font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
        text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;
        ${(p: GlobalMenuType) => p?.menuItemStyle || ''}
        ${(p: GlobalMenuType) => p?.itemStyle || ''}
        display: flex !important;
        align-items: center !important;

        .${(p) => p?.theme.prefixCls}-menu-title-content {
          flex: 1 !important;
          display: flex !important;
          align-items: center !important;
        }

        .anticon {
          margin-right: 10px !important;
        }

        .${(p) => p?.theme.prefixCls}-menu-submenu-arrow {
          color: ${(p: GlobalMenuType) => p?.colors?.itemColor || BLACK_CLR};
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
          ${(p: GlobalMenuType) => p?.styleOnHover || ''}
          ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemBackground ? `background: ${p?.colors?.hoverItemBackground} !important;` : ''}
          ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemColor ? `color: ${p?.colors?.hoverItemColor};` : ''}

          .anticon {
            ${(p: GlobalMenuType) => p?.styleOnHover || ''}
            ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemColor ? `color: ${p?.colors?.hoverItemColor};` : ''}
          }

          .${(p) => p?.theme.prefixCls}-menu-submenu-arrow {
            ${(p: GlobalMenuType) => p?.styleOnHover || ''}
            ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemColor ? `color: ${p?.colors?.hoverItemColor} !important;` : ''}
          }
        }
      }

      &.${(p) => p?.theme.prefixCls}-menu-submenu-selected {
        .${(p) => p?.theme.prefixCls}-menu-submenu-title {
          color: ${(p: GlobalMenuType) => p?.colors?.selectedItemColor || BLACK_CLR} !important;
          background: ${(p: GlobalMenuType) => p?.colors?.selectedItemBackground || 'transparent'} !important;
          ${(p: GlobalMenuType) => p?.styleOnSelected || ''}
        }
      }
    }

    .${(p) => p?.theme.prefixCls}-menu-item-active {
      ${(p: GlobalMenuType) => p?.styleOnHover || `
        color: ${p?.colors?.hoverItemColor || BLACK_CLR};
        background: ${p?.colors?.hoverItemBackground || 'transparent'};
      `}

      .${(p) => p?.theme.prefixCls}-menu-title-content {
        ${(p: GlobalMenuType) => p?.styleOnHover || ''}
        ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemColor ? `color: ${p?.colors?.hoverItemColor};` : ''}
      }

      .anticon {
        ${(p: GlobalMenuType) => p?.styleOnHover || ''}
        ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemColor ? `color: ${p?.colors?.hoverItemColor};` : ''}
      }
    }

    .${(p) => p?.theme.prefixCls}-menu-submenu-active {
      /* Removed hover styles from active state - they should only apply on :hover */

      /* When submenu has a selected child */
      &.${(p) => p?.theme.prefixCls}-menu-submenu-selected {
        .${(p) => p?.theme.prefixCls}-menu-submenu-title {
          color: ${(p: GlobalMenuType) => p?.colors?.selectedItemColor || BLACK_CLR} !important;
          background: ${(p: GlobalMenuType) => p?.colors?.selectedItemBackground || 'transparent'} !important;
          ${(p: GlobalMenuType) => p?.styleOnSelected || ''}
        }
      }
    }
  }
`;

export const ScopedMenuStyles: NamedExoticComponent<IGlobalMenuProps> = createGlobalStyle`
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
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId}.${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-horizontal > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu > .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-title .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-submenu-arrow {
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

  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub,
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-inline,
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu,
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub,
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-inline,
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu {

    ${(p: GlobalMenuType) => p?.styleOnSubMenu};

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
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub,
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-inline,
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu {
    .${(p) => p?.theme.prefixCls}-menu-submenu-arrow {
      display: inline-block !important;
    }
  }

  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub,
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-inline,
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu,
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub,
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-inline,
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu {

    .${(p) => p?.theme.prefixCls}-menu-item {
      color: ${(p: GlobalMenuType) => p?.colors?.itemColor || BLACK_CLR};
      ${(p: GlobalMenuType) => p?.colors?.itemBackground ? `background: ${p.colors.itemBackground};` : ''}
      margin: 0 !important;
      margin-right: 0 !important;
      padding: 0 3px !important;
      font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
      font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
      text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;
      ${(p: GlobalMenuType) => p?.menuItemStyle || ''}
      ${(p: GlobalMenuType) => p?.itemStyle || ''}

      .anticon {
        margin-left: 10px !important;
      }

      &:hover {
        ${(p: GlobalMenuType) => p?.styleOnHover || ''}
        ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemColor ? `color: ${p?.colors?.hoverItemColor};` : ''}
        ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemBackground ? `background: ${p?.colors?.hoverItemBackground} !important;` : ''}

        .anticon {
          ${(p: GlobalMenuType) => p?.styleOnHover || ''}
          ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemColor ? `color: ${p?.colors?.hoverItemColor};` : ''}
        }
      }

      &.${(p) => p?.theme.prefixCls}-menu-item-selected {
        ${(p: GlobalMenuType) => p?.styleOnSelected || `
          color: ${p?.colors.selectedItemColor || BLACK_CLR} !important;
          background: ${p?.colors?.selectedItemBackground || 'transparent'} !important;
        `}
      }
    }

    .${(p) => p?.theme.prefixCls}-menu-submenu {
      .${(p) => p?.theme.prefixCls}-menu-submenu-title {
        color: ${(p: GlobalMenuType) => p?.colors?.itemColor || BLACK_CLR};
        ${(p: GlobalMenuType) => p?.colors?.itemBackground ? `background: ${p.colors.itemBackground};` : ''}
        margin: 0 !important;
        margin-right: 0 !important;
        padding: 0 3px !important;
        font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
        font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
        text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;
        ${(p: GlobalMenuType) => p?.menuItemStyle || ''}
        ${(p: GlobalMenuType) => p?.itemStyle || ''}
        display: flex !important;
        align-items: center !important;

        .${(p) => p?.theme.prefixCls}-menu-title-content {
          flex: 1 !important;
          display: flex !important;
          align-items: center !important;
        }

        .anticon {
          margin-left: 10px !important;
        }

        &:hover {
          ${(p: GlobalMenuType) => p?.styleOnHover || ''}
          ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemColor ? `color: ${p?.colors?.hoverItemColor};` : ''}

          .anticon {
            ${(p: GlobalMenuType) => p?.styleOnHover || ''}
            ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemColor ? `color: ${p?.colors?.hoverItemColor};` : ''}
          }

          .${(p) => p?.theme.prefixCls}-menu-submenu-arrow {
            ${(p: GlobalMenuType) => p?.styleOnHover || ''}
            ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemColor ? `color: ${p?.colors?.hoverItemColor} !important;` : ''}
          }
        }

        .${(p) => p?.theme.prefixCls}-menu-submenu-arrow {
          color: ${(p: GlobalMenuType) => p?.colors?.itemColor || BLACK_CLR};
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
          background: ${(p: GlobalMenuType) => p?.colors?.selectedItemBackground || 'transparent'} !important;
          ${(p: GlobalMenuType) => p?.styleOnSelected || ''}
        }
      }
    }

    .${(p) => p?.theme.prefixCls}-menu-item-active {
      ${(p: GlobalMenuType) => p?.styleOnHover || `
        color: ${p?.colors?.hoverItemColor || BLACK_CLR};
        background: ${p?.colors?.hoverItemBackground || 'transparent'};
      `}

      .${(p) => p?.theme.prefixCls}-menu-title-content {
        ${(p: GlobalMenuType) => p?.styleOnHover || ''}
        ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemColor ? `color: ${p?.colors?.hoverItemColor};` : ''}
      }

      .anticon {
        ${(p: GlobalMenuType) => p?.styleOnHover || ''}
        ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemColor ? `color: ${p?.colors?.hoverItemColor};` : ''}
      }
    }

    .${(p) => p?.theme.prefixCls}-menu-submenu-active {
      /* Removed hover styles from active state - they should only apply on :hover */

      /* When submenu has a selected child */
      &.${(p) => p?.theme.prefixCls}-menu-submenu-selected {
        .${(p) => p?.theme.prefixCls}-menu-submenu-title {
          color: ${(p: GlobalMenuType) => p?.colors?.selectedItemColor || BLACK_CLR} !important;
          background: ${(p: GlobalMenuType) => p?.colors?.selectedItemBackground || 'transparent'} !important;
          ${(p: GlobalMenuType) => p?.styleOnSelected || ''}
        }
      }
    }
  }
`;
