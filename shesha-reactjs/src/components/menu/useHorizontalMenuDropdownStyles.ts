import { useLayoutEffect } from 'react';
import { ILayoutColor } from './model';

interface UseHorizontalMenuDropdownStylesProps {
  menuId?: string;
  colors?: ILayoutColor;
  fontStyles?: React.CSSProperties;
  styleOnSubMenu?: React.CSSProperties;
}

const BLACK_CLR = "#000000e0";

export const useHorizontalMenuDropdownStyles = ({
  menuId,
  colors,
  fontStyles,
  styleOnSubMenu,
}: UseHorizontalMenuDropdownStylesProps): void => {
  useLayoutEffect(() => {
    const styleId = `horizontal-menu-dropdown-styles-${menuId}`;

    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Dropdown styles for horizontalMenu-${menuId} */
      .horizontal-menu-${menuId}-dropdown .ant-menu {
        background: ${colors.itemBackground || 'transparent'} !important;
        border: none !important;
        font-family: ${fontStyles?.fontFamily} !important;
        font-weight: ${fontStyles?.fontWeight} !important;
        text-align: ${fontStyles?.textAlign} !important;
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item {
        color: ${colors.itemColor || BLACK_CLR} !important;
        background: ${colors.itemBackground || 'transparent'} !important;
        border: none !important;
        margin: 0 !important;
        font-family: ${fontStyles?.fontFamily} !important;
        font-weight: ${fontStyles?.fontWeight} !important;
        text-align: ${fontStyles?.textAlign} !important;
      }
      
      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item:hover {
        color: ${colors.hoverItemColor || BLACK_CLR} !important;
        background: ${colors.hoverItemBackground || 'transparent'} !important;
      }
      
      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item.ant-menu-item-selected {
        color: ${colors.selectedItemColor || BLACK_CLR} !important;
        background: ${colors.selectedItemBackground || 'transparent'} !important;
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu .ant-menu-submenu-title {
        color: ${colors.itemColor || BLACK_CLR} !important;
        background: ${colors.itemBackground || 'transparent'} !important;
        border: none !important;
        margin: 0 !important;
        font-family: ${fontStyles?.fontFamily} !important;
        font-weight: ${fontStyles?.fontWeight} !important;
        text-align: ${fontStyles?.textAlign} !important;
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu .ant-menu-submenu-title:hover {
        color: ${colors.hoverItemColor || BLACK_CLR} !important;
        background: ${colors.hoverItemBackground || 'transparent'} !important;
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu.ant-menu-submenu-selected .ant-menu-submenu-title {
        color: ${colors.selectedItemColor || BLACK_CLR} !important;
        background: ${colors.selectedItemBackground || 'transparent'} !important;
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item-active {
        color: ${colors.hoverItemColor || BLACK_CLR} !important;
        background: ${colors.hoverItemBackground || 'transparent'} !important;
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu-active .ant-menu-submenu-title {
        color: ${colors.hoverItemColor || BLACK_CLR} !important;
        background: ${colors.hoverItemBackground || 'transparent'} !important;
      }
    `;

    document.head.appendChild(style);

    return () => {
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [menuId, colors, fontStyles, styleOnSubMenu]);
};
