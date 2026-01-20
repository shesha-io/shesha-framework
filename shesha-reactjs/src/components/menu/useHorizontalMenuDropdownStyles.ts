import { useLayoutEffect } from 'react';
import { ILayoutColor } from './model';
import { convertJsonToCss } from '@/utils';

interface UseHorizontalMenuDropdownStylesProps {
  menuId?: string;
  colors?: ILayoutColor;
  fontStyles?: React.CSSProperties;
  styleOnHover?: React.CSSProperties;
  styleOnSelected?: React.CSSProperties;
  styleOnSubMenu?: React.CSSProperties;
}

const BLACK_CLR = "#000000e0";

export const useHorizontalMenuDropdownStyles = ({
  menuId,
  colors,
  fontStyles,
  styleOnHover,
  styleOnSelected,
  styleOnSubMenu,
}: UseHorizontalMenuDropdownStylesProps): void => {
  useLayoutEffect(() => {
    if (!menuId) return undefined;

    const styleId = `horizontal-menu-dropdown-styles-${menuId}`;

    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    const customStyleOnHover = convertJsonToCss(styleOnHover);
    const customStyleOnSelected = convertJsonToCss(styleOnSelected);
    const customStyleOnSubMenu = convertJsonToCss(styleOnSubMenu);

    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = `
      /* Dropdown styles for horizontalMenu-${menuId} */
      .horizontal-menu-${menuId}-dropdown .ant-menu {
        border: none !important;
        font-family: ${fontStyles?.fontFamily} !important;
        font-weight: ${fontStyles?.fontWeight} !important;
        text-align: ${fontStyles?.textAlign} !important;
        ${customStyleOnSubMenu || ''}
      }

      /* All menu items in dropdown get styleOnSubMenu */
      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item {
        border: none !important;
        margin: 0 !important;
        font-family: ${fontStyles?.fontFamily} !important;
        font-weight: ${fontStyles?.fontWeight} !important;
        text-align: ${fontStyles?.textAlign} !important;
        ${customStyleOnSubMenu || ''}
      }

      /* Submenu titles in dropdown get styleOnSubMenu */
      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu .ant-menu-submenu-title {
        border: none !important;
        margin: 0 !important;
        font-family: ${fontStyles?.fontFamily} !important;
        font-weight: ${fontStyles?.fontWeight} !important;
        text-align: ${fontStyles?.textAlign} !important;
        ${customStyleOnSubMenu || ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu:hover{
        ${customStyleOnHover}
      }

      ${customStyleOnHover ? `
        .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item:hover {
          ${customStyleOnHover}
        }

        .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu .ant-menu-submenu-title:hover {
          ${customStyleOnHover}
        }

        .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item-active {
          ${customStyleOnHover}
        }

        .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu-active .ant-menu-submenu-title {
          ${customStyleOnHover}
        }
      ` : ''}

      ${customStyleOnSelected ? `
        .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item.ant-menu-item-selected {
          ${customStyleOnSelected}
        }

        .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu.ant-menu-submenu-selected .ant-menu-submenu-title {
          ${customStyleOnSelected}
        }
      ` : ''}
    `;

    document.head.appendChild(styleElement);

    return () => {
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [menuId, colors, fontStyles, styleOnHover, styleOnSelected, styleOnSubMenu]);
};
