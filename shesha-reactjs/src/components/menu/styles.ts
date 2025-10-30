import { createGlobalStyle, createStyles } from "antd-style";
import { ILayoutColor } from "./model";
import { NamedExoticComponent } from "react";
import { GlobalTheme } from "antd-style/lib/factories/createGlobalStyle";

interface IStyleProps {
  colors: ILayoutColor;
  fontSize?: string;
  isScrolling: boolean;
  padding?: { x: string; y: string };
  styleOnHover?: string;
  styleOnSelected?: string;
  width: string;
  fontStyles?: React.CSSProperties;
}

interface IGlobalMenuProps {
  colors: ILayoutColor;
  styleOnHover?: string;
  styleOnSelected?: string;
  styleOnSubMenu?: string;
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
      styleOnHover,
      styleOnSelected,
      width,
      fontStyles,
    }: IStyleProps,
  ) => {
    const menuContainer = css`
      display: flex;
      ${colors?.itemBackground ? `background: ${colors.itemBackground};` : ''}
      flex-direction: row;
      white-space: nowrap;
      align-items: center;
      height: 100%;
      width: ${width};
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
      ? css`
        display: flex;
        width: ${width};
        overflow-x: scroll;
        overflow-y: hidden;
        scrollbar-width: none;

        ::-webkit-scrollbar {
          display: none;
        }
      `
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

        /* Only style direct children of the main menu, not dropdown items */
        > .${prefixCls}-menu-submenu, > .${prefixCls}-menu-item {
          padding: ${padding?.y}px ${padding?.x}px;
          color: ${colors?.itemColor ?? BLACK_CLR};
          ${colors?.itemBackground ? `background: ${colors.itemBackground};` : ''}
          font-family: ${fontStyles?.fontFamily};
          font-size: ${fontSize ? `${fontSize}px` : fontStyles?.fontSize};
          font-weight: ${fontStyles?.fontWeight};

          .${prefixCls}-menu-submenu-title {
            color: ${colors?.itemColor ?? BLACK_CLR};
            font-family: ${fontStyles?.fontFamily};
            font-size: ${fontSize ? `${fontSize}px` : fontStyles?.fontSize};
            font-weight: ${fontStyles?.fontWeight};

            .${prefixCls}-icon {
              font-size: ${fontSize ? `${fontSize}px` : fontStyles?.fontSize};
              color: ${colors?.itemColor ?? BLACK_CLR};

              &:hover {
                ${styleOnHover}
              }
            }

            &:hover {
             ${styleOnHover}
            }
          }

          &:hover {
            ${styleOnHover ? styleOnHover : `
              background: ${colors?.hoverItemBackground
                ? `${colors.hoverItemBackground} !important`
                : "transparent"};
              color: ${colors?.hoverItemColor
                ? `${colors.hoverItemColor} !important`
                : BLACK_CLR};
            `}
          }
        }

        /* Only style direct children active states */
        > .${prefixCls}-menu-submenu-active {
          ${styleOnHover ? styleOnHover : `
            background: ${colors?.hoverItemBackground
              ? `${colors.hoverItemBackground} !important`
              : "transparent"};

            .${prefixCls}-menu-submenu-title {
              color: ${colors?.hoverItemColor ?? BLACK_CLR};
              font-family: ${fontStyles?.fontFamily};
              font-size: ${fontSize ? `${fontSize}px` : fontStyles?.fontSize};
              font-weight: ${fontStyles?.fontWeight};
            }
          `}
        }

        > .${prefixCls}-menu-item-selected {
          ${styleOnSelected ? styleOnSelected : `
            background: ${colors?.selectedItemBackground
              ? `${colors.selectedItemBackground} !important`
              : "transparent"};
            color: ${colors?.selectedItemColor
              ? `${colors.selectedItemColor} !important`
              : BLACK_CLR};
          `}
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
      ${colors?.itemBackground ? `background: ${colors.itemBackground};` : ''}
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

    const editMode = css`
      .edit-mode {
        pointer-events: none;
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
      editMode,
    };
  },
);

export const GlobalMenuStyles: NamedExoticComponent<IGlobalMenuProps> = createGlobalStyle`
  .edit-mode {
    pointer-events: none;
  }
  .edit-mode .sha-configurable-sidemenu-button-wrapper {
    pointer-events: auto;
  }

  /* Styles for dropdown/submenu popups ONLY */
  .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub {
    border: none !important;
    box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05) !important;
    font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
    font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
    text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;

    /* Apply styleOnSubMenu to the container */
    ${(p: GlobalMenuType) => p?.styleOnSubMenu};

    .${(p) => p?.theme.prefixCls}-menu-submenu-arrow {
      display: none !important;
    }

    /* All items inside dropdown panels get styleOnSubMenu */
    .${(p) => p?.theme.prefixCls}-menu-item {
      border: none !important;
      margin: 0 !important;
      font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
      font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
      text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;

      /* Apply styleOnSubMenu LAST to override colors */
      ${(p: GlobalMenuType) => p?.styleOnSubMenu};

      &:hover {
        ${(p: GlobalMenuType) => p?.styleOnHover || `
          color: ${p?.colors?.hoverItemColor || BLACK_CLR} !important;
          background: ${p?.colors?.hoverItemBackground || 'transparent'} !important;
        `}
      }

      &.${(p) => p?.theme.prefixCls}-menu-item-selected {
        ${(p: GlobalMenuType) => p?.styleOnSelected || `
          color: ${p?.colors?.selectedItemColor || BLACK_CLR} !important;
          background: ${p?.colors?.selectedItemBackground || 'transparent'} !important;
        `}
      }
    }

    /* Submenu titles inside dropdown panels */
    .${(p) => p?.theme.prefixCls}-menu-submenu {
      .${(p) => p?.theme.prefixCls}-menu-submenu-title {
        border: none !important;
        margin: 0 !important;
        font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
        font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
        text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;

        /* Apply styleOnSubMenu LAST to override colors */
        ${(p: GlobalMenuType) => p?.styleOnSubMenu};

        &:hover {
          ${(p: GlobalMenuType) => p?.styleOnHover || `
            color: ${p?.colors?.hoverItemColor || BLACK_CLR} !important;
            background: ${p?.colors?.hoverItemBackground || 'transparent'} !important;
          `}
        }

        .${(p) => p?.theme.prefixCls}-menu-submenu-arrow {
          color: ${(p: GlobalMenuType) => p?.colors?.itemColor || BLACK_CLR} !important;
        }
      }

      &.${(p) => p?.theme.prefixCls}-menu-submenu-selected {
        .${(p) => p?.theme.prefixCls}-menu-submenu-title {
          ${(p: GlobalMenuType) => p?.styleOnSelected || `
            color: ${p?.colors.selectedItemColor || BLACK_CLR} !important;
            background: ${p?.colors?.selectedItemBackground || 'transparent'} !important;
          `}
        }
      }
    }

    .${(p) => p?.theme.prefixCls}-menu-item-active {
      ${(p: GlobalMenuType) => p?.styleOnHover || `
        color: ${p?.colors?.hoverItemColor || BLACK_CLR} !important;
        background: ${p?.colors?.hoverItemBackground || 'transparent'} !important;
      `}
    }

    .${(p) => p?.theme.prefixCls}-menu-submenu-active {
      .${(p) => p?.theme.prefixCls}-menu-submenu-title {
        ${(p: GlobalMenuType) => p?.styleOnHover || `
          color: ${p?.colors?.hoverItemColor || BLACK_CLR} !important;
          background: ${p?.colors?.hoverItemBackground || 'transparent'} !important;
        `}
      }

      .${(p) => p?.theme.prefixCls}-menu-title-content {
        color: ${(p: GlobalMenuType) => p?.colors?.hoverItemColor || BLACK_CLR} !important;
      }
    }
  }
`;

export const ScopedMenuStyles: NamedExoticComponent<IGlobalMenuProps> = createGlobalStyle`
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId}.${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer {
    .${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer-content-wrapper,
    .${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer-content {
      ${(p: GlobalMenuType) => p?.colors?.itemBackground ? `background: ${p.colors.itemBackground} !important;` : ''}
    }
    .${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer-header {
      ${(p: GlobalMenuType) => p?.colors?.itemBackground ? `background: ${p.colors.itemBackground} !important;` : ''}
      color: ${(p: GlobalMenuType) => p?.colors?.itemColor || BLACK_CLR} !important;
      font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
      font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
      text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;
      border-bottom: none !important;

      .${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer-title {
        color: ${(p: GlobalMenuType) => p?.colors?.itemColor || BLACK_CLR} !important;
        font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
        font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
        text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;
      }
    }

    .${(p: GlobalMenuType) => p?.theme.prefixCls}-drawer-body {
      ${(p: GlobalMenuType) => p?.colors?.itemBackground ? `background: ${p.colors.itemBackground} !important;` : ''}
      padding: 0 !important;
    }
  }

  /* Styles for dropdown/submenu popups in scoped menus ONLY */
  .horizontal-menu-drawer-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub,
  .horizontal-menu-${(p: GlobalMenuType) => p?.menuId} .${(p: GlobalMenuType) => p?.theme.prefixCls}-menu-sub {

    border: none !important;
    font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
    font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
    text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;

    /* Apply styleOnSubMenu to the container */
    ${(p: GlobalMenuType) => p?.styleOnSubMenu};

    /* Hide submenu arrows */
    .${(p) => p?.theme.prefixCls}-menu-submenu-arrow {
      display: none !important;
    }

    /* All items inside dropdown panels get styleOnSubMenu */
    .${(p) => p?.theme.prefixCls}-menu-item {
      border: none !important;
      margin: 0 !important;
      font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
      font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
      text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;

      /* Apply styleOnSubMenu LAST to override colors */
      ${(p: GlobalMenuType) => p?.styleOnSubMenu};

      &:hover {
        ${(p: GlobalMenuType) => p?.styleOnHover || `
          color: ${p?.colors?.hoverItemColor || BLACK_CLR} !important;
          background: ${p?.colors?.hoverItemBackground || 'transparent'} !important;
        `}
      }

      &.${(p) => p?.theme.prefixCls}-menu-item-selected {
        ${(p: GlobalMenuType) => p?.styleOnSelected || `
          color: ${p?.colors.selectedItemColor || BLACK_CLR} !important;
          background: ${p?.colors?.selectedItemBackground || 'transparent'} !important;
        `}
      }
    }

    /* Submenu titles inside dropdown panels */
    .${(p) => p?.theme.prefixCls}-menu-submenu {
      .${(p) => p?.theme.prefixCls}-menu-submenu-title {
        border: none !important;
        margin: 0 !important;
        font-family: ${(p: GlobalMenuType) => p?.fontStyles?.fontFamily} !important;
        font-weight: ${(p: GlobalMenuType) => p?.fontStyles?.fontWeight} !important;
        text-align: ${(p: GlobalMenuType) => p?.fontStyles?.textAlign} !important;

        /* Apply styleOnSubMenu LAST to override colors */
        ${(p: GlobalMenuType) => p?.styleOnSubMenu};

        &:hover {
          ${(p: GlobalMenuType) => p?.styleOnHover || `
            color: ${p?.colors?.hoverItemColor || BLACK_CLR} !important;
            background: ${p?.colors?.hoverItemBackground || 'transparent'} !important;
          `}
        }

        .${(p) => p?.theme.prefixCls}-menu-submenu-arrow {
          color: ${(p: GlobalMenuType) => p?.colors?.itemColor || BLACK_CLR} !important;
        }
      }

      &.${(p) => p?.theme.prefixCls}-menu-submenu-selected {
        .${(p) => p?.theme.prefixCls}-menu-submenu-title {
          ${(p: GlobalMenuType) => p?.styleOnSelected || `
            color: ${p?.colors.selectedItemColor || BLACK_CLR} !important;
            background: ${p?.colors?.selectedItemBackground || 'transparent'} !important;
          `}
        }
      }
    }

    .${(p) => p?.theme.prefixCls}-menu-item-active {
      ${(p: GlobalMenuType) => p?.styleOnHover || `
        color: ${p?.colors?.hoverItemColor || BLACK_CLR} !important;
        background: ${p?.colors?.hoverItemBackground || 'transparent'} !important;
      `}
    }

    .${(p) => p?.theme.prefixCls}-menu-submenu-active {
      .${(p) => p?.theme.prefixCls}-menu-submenu-title {
        ${(p: GlobalMenuType) => p?.styleOnHover || `
          color: ${p?.colors?.hoverItemColor || BLACK_CLR} !important;
          background: ${p?.colors?.hoverItemBackground || 'transparent'} !important;
        `}
      }

      .${(p) => p?.theme.prefixCls}-menu-title-content {
        color: ${(p: GlobalMenuType) => p?.colors?.hoverItemColor || BLACK_CLR} !important;
      }
    }
  }
`;
