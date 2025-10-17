import { useLayoutEffect } from 'react';
import { ILayoutColor } from './model';
import { convertJsonToCss } from '@/utils';

interface UseHorizontalMenuDropdownStylesProps {
  menuId?: string;
  colors?: ILayoutColor;
  fontStyles?: React.CSSProperties;
  style?: React.CSSProperties;
  styleOnHover?: React.CSSProperties;
  styleOnSelected?: React.CSSProperties;
  styleOnSubMenu?: React.CSSProperties;
}

const BLACK_CLR = "#000000e0";

export const useHorizontalMenuDropdownStyles = ({
  menuId,
  colors,
  fontStyles,
  style,
  styleOnHover,
  styleOnSelected,
  styleOnSubMenu,
}: UseHorizontalMenuDropdownStylesProps): void => {
  useLayoutEffect(() => {
    if (!menuId) return;

    const styleId = `horizontal-menu-dropdown-styles-${menuId}`;

    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    const customStyle = convertJsonToCss(style);
    const customStyleOnHover = convertJsonToCss(styleOnHover);
    const customStyleOnSelected = convertJsonToCss(styleOnSelected);
    const customStyleOnSubMenu = convertJsonToCss(styleOnSubMenu);

    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = `
      /* Dropdown styles for horizontalMenu-${menuId} */
      .horizontal-menu-${menuId}-dropdown .ant-menu {
        ${customStyleOnSubMenu || customStyle || `
          background: ${colors?.itemBackground || 'transparent'} !important;
        `}
        border: none !important;
        font-family: ${fontStyles?.fontFamily} !important;
        font-weight: ${fontStyles?.fontWeight} !important;
        text-align: ${fontStyles?.textAlign} !important;
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item {
        ${customStyle || `
          color: ${colors?.itemColor || BLACK_CLR} !important;
          background: ${colors?.itemBackground || 'transparent'} !important;
        `}
        border: none !important;
        margin: 0 !important;
        font-family: ${fontStyles?.fontFamily} !important;
        font-weight: ${fontStyles?.fontWeight} !important;
        text-align: ${fontStyles?.textAlign} !important;
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item:hover {
        ${customStyleOnHover || `
          color: ${colors?.hoverItemColor || BLACK_CLR} !important;
          background: ${colors?.hoverItemBackground || 'transparent'} !important;
        `}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item.ant-menu-item-selected {
        ${customStyleOnSelected || `
          color: ${colors?.selectedItemColor || BLACK_CLR} !important;
          background: ${colors?.selectedItemBackground || 'transparent'} !important;
        `}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu .ant-menu-submenu-title {
        ${customStyleOnSubMenu || customStyle || `
          color: ${colors?.itemColor || BLACK_CLR} !important;
          background: ${colors?.itemBackground || 'transparent'} !important;
        `}
        border: none !important;
        margin: 0 !important;
        font-family: ${fontStyles?.fontFamily} !important;
        font-weight: ${fontStyles?.fontWeight} !important;
        text-align: ${fontStyles?.textAlign} !important;
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu .ant-menu-submenu-title:hover {
        ${customStyleOnHover || `
          color: ${colors?.hoverItemColor || BLACK_CLR} !important;
          background: ${colors?.hoverItemBackground || 'transparent'} !important;
        `}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu.ant-menu-submenu-selected .ant-menu-submenu-title {
        ${customStyleOnSelected || `
          color: ${colors?.selectedItemColor || BLACK_CLR} !important;
          background: ${colors?.selectedItemBackground || 'transparent'} !important;
        `}
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
  }, [menuId, colors, fontStyles, style, styleOnHover, styleOnSelected, styleOnSubMenu]);
};
