import { useLayoutEffect } from 'react';
import { ILayoutColor } from './model';
import { convertJsonToCss } from '@/utils';

interface UseHorizontalMenuDropdownStylesProps {
  menuId?: string;
  colors?: ILayoutColor;
  fontStyles?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  styleOnHover?: React.CSSProperties;
  styleOnSelected?: React.CSSProperties;
  styleOnSubMenu?: React.CSSProperties;
  menuItemStyle?: React.CSSProperties;
}

const BLACK_CLR = "#000000e0";

export const useHorizontalMenuDropdownStyles = ({
  menuId,
  colors,
  fontStyles,
  itemStyle,
  styleOnHover,
  styleOnSelected,
  styleOnSubMenu,
  menuItemStyle,
}: UseHorizontalMenuDropdownStylesProps): void => {
  useLayoutEffect(() => {
    if (!menuId) return undefined;

    const styleId = `horizontal-menu-dropdown-styles-${menuId}`;

    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    const customItemStyle = convertJsonToCss(itemStyle);
    const customStyleOnHover = convertJsonToCss(styleOnHover);
    const customStyleOnSelected = convertJsonToCss(styleOnSelected);
    const customStyleOnSubMenu = convertJsonToCss(styleOnSubMenu);
    const customMenuItemStyle = convertJsonToCss(menuItemStyle);

    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = `
      /* Dropdown styles for horizontalMenu-${menuId} */
      .horizontal-menu-${menuId}-dropdown .ant-menu {
        border: none;
        font-family: ${fontStyles?.fontFamily} !important;
        font-weight: ${fontStyles?.fontWeight} !important;
        text-align: ${fontStyles?.textAlign} !important;
        min-width: 100px !important;
        max-width: 400px !important;
        width: auto !important;
        ${colors?.subItemBackground || colors?.itemBackground ? `background: ${colors?.subItemBackground || colors?.itemBackground} !important;` : ''}
        ${customStyleOnSubMenu || ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item {
        border: none;
        margin: 0 !important;
        font-family: ${fontStyles?.fontFamily} !important;
        font-weight: ${fontStyles?.fontWeight} !important;
        text-align: ${fontStyles?.textAlign} !important;
        color: ${colors?.subItemColor || colors?.itemColor || BLACK_CLR} !important;
        ${colors?.subItemBackground || colors?.itemBackground ? `background: ${colors?.subItemBackground || colors?.itemBackground} !important;` : ''}
        ${customMenuItemStyle || ''}
        ${customItemStyle || ''}
        ${customStyleOnSubMenu || ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item:hover {
        ${customStyleOnHover || `
          color: ${colors?.hoverItemColor || BLACK_CLR} !important;
          background: ${colors?.hoverItemBackground || 'transparent'} !important;
        `}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item.ant-menu-item-selected {
        color: ${colors?.selectedItemColor || BLACK_CLR} !important;
        background: ${colors?.selectedItemBackground || 'transparent'} !important;
        ${customStyleOnSelected || ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu .ant-menu-submenu-title {
        border: none;
        margin: 0 !important;
        font-family: ${fontStyles?.fontFamily} !important;
        font-weight: ${fontStyles?.fontWeight} !important;
        text-align: ${fontStyles?.textAlign} !important;
        color: ${colors?.subItemColor || colors?.itemColor || BLACK_CLR} !important;
        ${colors?.subItemBackground || colors?.itemBackground ? `background: ${colors?.subItemBackground || colors?.itemBackground} !important;` : ''}
        ${customMenuItemStyle || ''}
        ${customItemStyle || ''}
        ${customStyleOnSubMenu || ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu .ant-menu-submenu-title:hover {
        ${customStyleOnHover || `
          color: ${colors?.hoverItemColor || BLACK_CLR} !important;
          background: ${colors?.hoverItemBackground || 'transparent'} !important;
        `}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu.ant-menu-submenu-selected .ant-menu-submenu-title {
        color: ${colors?.selectedItemColor || BLACK_CLR} !important;
        background: ${colors?.selectedItemBackground || 'transparent'} !important;
        ${customStyleOnSelected || ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item-active {
        ${customStyleOnHover || `
          color: ${colors?.hoverItemColor || BLACK_CLR} !important;
          background: ${colors?.hoverItemBackground || 'transparent'} !important;
        `}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu-active .ant-menu-submenu-title {
        ${customStyleOnHover || `
          color: ${colors?.hoverItemColor || BLACK_CLR} !important;
          background: ${colors?.hoverItemBackground || 'transparent'} !important;
        `}
      }
    `;

    document.head.appendChild(styleElement);

    return () => {
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [menuId, colors, fontStyles, itemStyle, styleOnHover, styleOnSelected, styleOnSubMenu, menuItemStyle]);
};
