import { createGlobalStyle, createStyles } from "antd-style";
import { ILayoutColor } from "./model";
import { NamedExoticComponent } from "react";
import { GlobalTheme } from "antd-style/lib/factories/createGlobalStyle";

interface IStyleProps {
  colors: ILayoutColor;
  isScrolling: boolean;
  padding?: { x: string; y: string };
  styleOnHover?: string;
  styleOnSelected?: string;
  width: string;
  fontStyles?: React.CSSProperties;
}

interface IGlobalMenuProps {
  colors: ILayoutColor;
  styleOnSubMenu: string;
}

type GlobalMenuType = IGlobalMenuProps | GlobalTheme | any;

const BLACK_CLR = "#000000e0";

export const useStyles = createStyles(
  (
    { css, cx, prefixCls },
    {
      colors,
      isScrolling,
      padding,
      styleOnHover,
      styleOnSelected,
      width,
      fontStyles
    }: IStyleProps
  ) => {
    const menuContainer = css`
      display: flex;
      background: ${colors?.itemBackground};
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
        background: ${colors?.itemBackground ?? "transparent"};
        font-size: ${fontStyles?.fontSize};
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
          padding: ${padding?.y}px ${padding?.x}px;
          color: ${colors?.itemColor ?? BLACK_CLR};
          background: ${colors?.itemBackground ?? "transparent"};
          font-family: ${fontStyles?.fontFamily};
          font-size: ${fontStyles?.fontSize};
          font-weight: ${fontStyles?.fontWeight};

          .${prefixCls}-menu-submenu-title {
            color: ${colors?.itemColor ?? BLACK_CLR};
            font-family: ${fontStyles?.fontFamily};
            font-size: ${fontStyles?.fontSize};
            font-weight: ${fontStyles?.fontWeight};
  
            .${prefixCls}-icon {
              font-size: ${fontStyles?.fontSize};
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
            background: ${colors?.hoverItemBackground
              ? `${colors.hoverItemBackground} !important`
              : "transparent"};
            color: ${colors?.hoverItemColor
              ? `${colors.hoverItemColor} !important`
              : BLACK_CLR};

            ${styleOnHover}
          }
        }

        .${prefixCls}-menu-submenu-active {
          background: ${colors?.hoverItemBackground
            ? `${colors.hoverItemBackground} !important`
            : "transparent"};

          .${prefixCls}-menu-submenu-title {
            color: ${colors?.hoverItemColor ?? BLACK_CLR};
            font-family: ${fontStyles?.fontFamily};
            font-size: ${fontStyles?.fontSize};
            font-weight: ${fontStyles?.fontWeight};
          }

          ${styleOnHover}
        }

        .${prefixCls}-menu-item-selected {
          background: ${colors?.selectedItemBackground
            ? `${colors.selectedItemBackground} !important`
            : "transparent"};
          color: ${colors?.selectedItemColor
            ? `${colors.selectedItemColor} !important`
            : BLACK_CLR};

          ${styleOnSelected}
        }

        ::-webkit-scrollbar {
          display: none;
        }
      `
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
      background: ${colors?.itemBackground ?? "#fff"};
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
  }
);

export const GlobalMenuStyles: NamedExoticComponent<IGlobalMenuProps> = createGlobalStyle`
  .${(p: GlobalMenuType) => p.theme.prefixCls}-menu-sub,
  .${(p: GlobalMenuType) => p.theme.prefixCls}-menu-inline {

    ${(p: GlobalMenuType) => p.styleOnSubMenu};

    .${(p) => p.theme.prefixCls}-menu-item-active {
      color: ${(p: GlobalMenuType) => p.colors.hoverItemColor} !important;
      background: ${(p: GlobalMenuType) => p.colors.hoverItemBackground} !important;
    }

    .${(p) => p.theme.prefixCls}-menu-submenu-active {
      color: ${(p: GlobalMenuType) => p.colors.hoverItemColor} !important;
      background: ${(p: GlobalMenuType) => p.colors.hoverItemBackground} !important;
      
      .${(p) => p.theme.prefixCls}-menu-title-content {
        color: ${(p: GlobalMenuType) => p.colors.hoverItemColor} !important;
      }

      .${(p) => p.theme.prefixCls}-menu-submenu-title {
        color: ${(p: GlobalMenuType) => p.colors.hoverItemColor} !important;
      }
    }
  }
`;
