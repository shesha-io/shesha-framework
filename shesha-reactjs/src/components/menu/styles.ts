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

        .${prefixCls}-menu-submenu, .${prefixCls}-menu-item {
          padding: 0 !important;
          color: ${colors?.itemColor ?? BLACK_CLR};
          ${colors?.itemBackground ? `background: ${colors.itemBackground};` : ''}
          margin-right: 0;
          font-family: ${fontStyles?.fontFamily};
          font-size: ${fontSize ? `${fontSize}px` : fontStyles?.fontSize};
          font-weight: ${fontStyles?.fontWeight};
          ${menuItemStyle || ''}
          ${itemStyle || ''}

          .${prefixCls}-menu-submenu-title {
            color: ${colors?.itemColor ?? BLACK_CLR};
            font-family: ${fontStyles?.fontFamily};
            font-size: ${fontSize ? `${fontSize}px` : fontStyles?.fontSize};
            font-weight: ${fontStyles?.fontWeight};
            ${itemStyle || ''}

            .${prefixCls}-icon {
              font-size: ${fontSize ? `${fontSize}px` : fontStyles?.fontSize};
              color: ${colors?.itemColor ?? BLACK_CLR};

              &:hover {
                ${styleOnHover || ''}
                ${!styleOnHover && colors?.hoverItemColor ? `color: ${colors.hoverItemColor};` : ''}
              }
            }

            &:hover {
             ${styleOnHover || ''}
             ${!styleOnHover && colors?.hoverItemBackground ? `background: ${colors.hoverItemBackground} !important;` : ''}
             ${!styleOnHover && colors?.hoverItemColor ? `color: ${colors.hoverItemColor};` : ''}
            }
          }

          &:hover {
            ${styleOnHover || ''}
            ${!styleOnHover && colors?.hoverItemBackground ? `background: ${colors.hoverItemBackground} !important;` : ''}
            ${!styleOnHover && colors?.hoverItemColor ? `color: ${colors.hoverItemColor};` : ''}
          }
        }

        .${prefixCls}-menu-item-active {
          ${styleOnHover || ''}
          ${!styleOnHover && colors?.hoverItemBackground ? `background: ${colors.hoverItemBackground} !important;` : ''}
          ${!styleOnHover && colors?.hoverItemColor ? `color: ${colors.hoverItemColor};` : ''}
        }

        .${prefixCls}-menu-submenu-active {
          ${styleOnHover || ''}
          ${!styleOnHover && colors?.hoverItemBackground ? `background: ${colors.hoverItemBackground} !important;` : ''}

          .${prefixCls}-menu-submenu-title {
            ${!styleOnHover && colors?.hoverItemColor ? `color: ${colors.hoverItemColor};` : ''}
            font-family: ${fontStyles?.fontFamily};
            font-size: ${fontSize ? `${fontSize}px` : fontStyles?.fontSize};
            font-weight: ${fontStyles?.fontWeight};
          }
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
      border: none !important;
      margin: 0 !important;
      margin-right: 0 !important;
      font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
      font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
      text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;
      ${(p: GlobalMenuType) => p?.menuItemStyle || ''}
      ${(p: GlobalMenuType) => p?.itemStyle || ''}
      &:hover {
        ${(p: GlobalMenuType) => p?.styleOnHover || ''}
        ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemColor ? `color: ${p?.colors?.hoverItemColor};` : ''}
        ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemBackground ? `background: ${p?.colors?.hoverItemBackground} !important;` : ''}
      }

      &.${(p) => p?.theme.prefixCls}-menu-item-selected {
        color: ${(p: GlobalMenuType) => p?.colors?.selectedItemColor || BLACK_CLR} !important;
        background: ${(p: GlobalMenuType) => p?.colors?.selectedItemBackground || 'transparent'} !important;
        ${(p: GlobalMenuType) => p?.styleOnSelected || ''}
      }
    }

    /* Parent submenu items (items that have children) */
    .${(p) => p?.theme.prefixCls}-menu-submenu {
      .${(p) => p?.theme.prefixCls}-menu-submenu-title {
        color: ${(p: GlobalMenuType) => p?.colors?.itemColor || BLACK_CLR};
        ${(p: GlobalMenuType) => p?.colors?.itemBackground ? `background: ${p.colors.itemBackground};` : ''}
        border: none !important;
        margin: 0 !important;
        margin-right: 0 !important;
        font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
        font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
        text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;
        ${(p: GlobalMenuType) => p?.menuItemStyle || ''}
        ${(p: GlobalMenuType) => p?.itemStyle || ''}

        &:hover {
          ${(p: GlobalMenuType) => p?.styleOnHover || ''}
          ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemColor ? `color: ${p?.colors?.hoverItemColor};` : ''}
          ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemBackground ? `background: ${p?.colors?.hoverItemBackground} !important;` : ''}
        }

        .${(p) => p?.theme.prefixCls}-menu-submenu-arrow {
          color: ${(p: GlobalMenuType) => p?.colors?.itemColor || BLACK_CLR};
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
    }

    .${(p) => p?.theme.prefixCls}-menu-submenu-active {
      .${(p) => p?.theme.prefixCls}-menu-submenu-title {
        ${(p: GlobalMenuType) => p?.styleOnHover || ''}
        ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemColor ? `color: ${p?.colors?.hoverItemColor};` : ''}
        ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemBackground ? `background: ${p?.colors?.hoverItemBackground} !important;` : ''}
      }

      .${(p) => p?.theme.prefixCls}-menu-title-content {
        color: ${(p: GlobalMenuType) => p?.colors?.hoverItemColor || BLACK_CLR};
      }

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
      border: none !important;
      margin: 0 !important;
      margin-right: 0 !important;
      font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
      font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
      text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;
      ${(p: GlobalMenuType) => p?.menuItemStyle || ''}
      ${(p: GlobalMenuType) => p?.itemStyle || ''}

      &:hover {
        ${(p: GlobalMenuType) => p?.styleOnHover || ''}
        ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemColor ? `color: ${p?.colors?.hoverItemColor};` : ''}
        ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemBackground ? `background: ${p?.colors?.hoverItemBackground} !important;` : ''}
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
        border: none !important;
        margin: 0 !important;
        margin-right: 0 !important;
        font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
        font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
        text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;
        ${(p: GlobalMenuType) => p?.menuItemStyle || ''}
        ${(p: GlobalMenuType) => p?.itemStyle || ''}

        &:hover {
          ${(p: GlobalMenuType) => p?.styleOnHover || ''}
          ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemColor ? `color: ${p?.colors?.hoverItemColor};` : ''}
          ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemBackground ? `background: ${p?.colors?.hoverItemBackground} !important;` : ''}
        }

        .${(p) => p?.theme.prefixCls}-menu-submenu-arrow {
          color: ${(p: GlobalMenuType) => p?.colors?.itemColor || BLACK_CLR};
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
    }

    .${(p) => p?.theme.prefixCls}-menu-submenu-active {
      .${(p) => p?.theme.prefixCls}-menu-submenu-title {
        ${(p: GlobalMenuType) => p?.styleOnHover || ''}
        ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemColor ? `color: ${p?.colors?.hoverItemColor};` : ''}
        ${(p: GlobalMenuType) => !p?.styleOnHover && p?.colors?.hoverItemBackground ? `background: ${p?.colors?.hoverItemBackground} !important;` : ''}
      }

      .${(p) => p?.theme.prefixCls}-menu-title-content {
        color: ${(p: GlobalMenuType) => p?.colors?.hoverItemColor || BLACK_CLR};
      }

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
