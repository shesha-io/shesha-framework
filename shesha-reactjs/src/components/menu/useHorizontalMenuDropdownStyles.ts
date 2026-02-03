import { useLayoutEffect } from 'react';
import { ILayoutColor } from './model';
import { convertJsonToCss, convertJsonToCssWithImportant } from '@/utils';

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
    const customStyleOnHover = convertJsonToCssWithImportant(styleOnHover);
    const customStyleOnSelected = convertJsonToCssWithImportant(styleOnSelected);
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
        min-width: 200px !important;
        max-width: 400px !important;
        width: 200px !important;
        ${colors?.subItemBackground || colors?.itemBackground ? `background: ${colors?.subItemBackground || colors?.itemBackground} !important;` : ''}
        ${customStyleOnSubMenu || ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item {
        margin: 0 !important;
        font-family: ${fontStyles?.fontFamily} !important;
        font-weight: ${fontStyles?.fontWeight} !important;
        text-align: ${fontStyles?.textAlign} !important;
        color: ${colors?.subItemColor || colors?.itemColor || BLACK_CLR};
        ${colors?.subItemBackground || colors?.itemBackground ? `background: ${colors?.subItemBackground || colors?.itemBackground};` : ''}
        ${customMenuItemStyle || ''}
        ${customItemStyle || ''}
        ${customStyleOnSubMenu || ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item .anticon {
        margin-left: 10px !important;
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item:hover,
      .horizontal-menu-${menuId}-dropdown .ant-menu-item:hover {
        ${!customStyleOnHover && colors?.hoverItemColor ? `color: ${colors?.hoverItemColor} !important;` : ''}
        ${!customStyleOnHover && colors?.hoverItemBackground ? `background: ${colors?.hoverItemBackground} !important;` : ''}
        ${customStyleOnHover || ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item:hover .anticon,
      .horizontal-menu-${menuId}-dropdown .ant-menu-item:hover .anticon {
        ${!customStyleOnHover && colors?.hoverItemColor ? `color: ${colors?.hoverItemColor} !important;` : ''}
        ${customStyleOnHover || ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item.ant-menu-item-selected {
        color: ${colors?.selectedItemColor || BLACK_CLR} !important;
        background: ${colors?.selectedItemBackground || 'transparent'} !important;
        ${customStyleOnSelected || ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu .ant-menu-submenu-title {
        margin: 0 !important;
        font-family: ${fontStyles?.fontFamily} !important;
        font-weight: ${fontStyles?.fontWeight} !important;
        text-align: ${fontStyles?.textAlign} !important;
        color: ${colors?.subItemColor || colors?.itemColor || BLACK_CLR};
        ${colors?.subItemBackground || colors?.itemBackground ? `background: ${colors?.subItemBackground || colors?.itemBackground};` : ''}
        ${customMenuItemStyle || ''}
        ${customItemStyle || ''}
        ${customStyleOnSubMenu || ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu .ant-menu-submenu-title .anticon {
        margin-left: 10px !important;
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu .ant-menu-submenu-title:hover {
        ${!customStyleOnHover && colors?.hoverItemColor ? `color: ${colors?.hoverItemColor} !important;` : ''}
        ${!customStyleOnHover && colors?.hoverItemBackground ? `background: ${colors?.hoverItemBackground} !important;` : ''}
        ${customStyleOnHover || ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu .ant-menu-submenu-title:hover .anticon {
        ${!customStyleOnHover && colors?.hoverItemColor ? `color: ${colors?.hoverItemColor} !important;` : ''}
        ${customStyleOnHover || ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu.ant-menu-submenu-selected .ant-menu-submenu-title {
        color: ${colors?.selectedItemColor || BLACK_CLR} !important;
        background: ${colors?.selectedItemBackground || 'transparent'} !important;
        ${customStyleOnSelected || ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item-active {
        ${customStyleOnHover || ''}
        ${!customStyleOnHover && colors?.hoverItemColor ? `color: ${colors?.hoverItemColor};` : ''}
        ${!customStyleOnHover && colors?.hoverItemBackground ? `background: ${colors?.hoverItemBackground} !important;` : ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item-active .anticon {
        ${customStyleOnHover || ''}
        ${!customStyleOnHover && colors?.hoverItemColor ? `color: ${colors?.hoverItemColor};` : ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu-active .ant-menu-submenu-title {
        ${customStyleOnHover || ''}
        ${!customStyleOnHover && colors?.hoverItemColor ? `color: ${colors?.hoverItemColor};` : ''}
        ${!customStyleOnHover && colors?.hoverItemBackground ? `background: ${colors?.hoverItemBackground} !important;` : ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu-active .ant-menu-submenu-title .anticon {
        ${customStyleOnHover || ''}
        ${!customStyleOnHover && colors?.hoverItemColor ? `color: ${colors?.hoverItemColor};` : ''}
      }

    `;

    document.head.appendChild(styleElement);

    // Add global styles for nested submenu popups
    const nestedStyleId = `horizontal-menu-nested-dropdown-styles-${menuId}`;
    const existingNestedStyle = document.getElementById(nestedStyleId);
    if (existingNestedStyle) {
      existingNestedStyle.remove();
    }

    const nestedStyleElement = document.createElement('style');
    nestedStyleElement.id = nestedStyleId;
    nestedStyleElement.textContent = `
      /* Standardize nested submenu popup widths for this menu */
      .horizontal-menu-${menuId}-dropdown.ant-menu-submenu-popup .ant-menu {
        min-width: 200px !important;
        max-width: 400px !important;
        width: 200px !important;
      }

      /* Leaf items (without children) in submenu popups */
      .horizontal-menu-${menuId}-dropdown.ant-menu-submenu-popup .ant-menu-item {
        ${customMenuItemStyle || ''}
        ${customItemStyle || ''}
      }

      .horizontal-menu-${menuId}-dropdown.ant-menu-submenu-popup .ant-menu-item .anticon {
        margin-left: 10px !important;
      }

      .horizontal-menu-${menuId}-dropdown.ant-menu-submenu-popup .ant-menu-item:hover {
        ${!customStyleOnHover && colors?.hoverItemColor ? `color: ${colors?.hoverItemColor} !important;` : ''}
        ${!customStyleOnHover && colors?.hoverItemBackground ? `background: ${colors?.hoverItemBackground} !important;` : ''}
        ${customStyleOnHover || ''}
      }

      .horizontal-menu-${menuId}-dropdown.ant-menu-submenu-popup .ant-menu-item:hover .anticon {
        ${!customStyleOnHover && colors?.hoverItemColor ? `color: ${colors?.hoverItemColor} !important;` : ''}
        ${customStyleOnHover || ''}
      }

      /* Submenu items (with children) in submenu popups */
      .horizontal-menu-${menuId}-dropdown.ant-menu-submenu-popup .ant-menu-submenu .ant-menu-submenu-title {
        ${customMenuItemStyle || ''}
        ${customItemStyle || ''}
      }

      .horizontal-menu-${menuId}-dropdown.ant-menu-submenu-popup .ant-menu-submenu .ant-menu-submenu-title .anticon {
        margin-left: 10px !important;
      }

      .horizontal-menu-${menuId}-dropdown.ant-menu-submenu-popup .ant-menu-submenu .ant-menu-submenu-title:hover {
        ${!customStyleOnHover && colors?.hoverItemColor ? `color: ${colors?.hoverItemColor} !important;` : ''}
        ${!customStyleOnHover && colors?.hoverItemBackground ? `background: ${colors?.hoverItemBackground} !important;` : ''}
        ${customStyleOnHover || ''}
      }

      .horizontal-menu-${menuId}-dropdown.ant-menu-submenu-popup .ant-menu-submenu .ant-menu-submenu-title:hover .anticon {
        ${!customStyleOnHover && colors?.hoverItemColor ? `color: ${colors?.hoverItemColor} !important;` : ''}
        ${customStyleOnHover || ''}
      }
    `;

    document.head.appendChild(nestedStyleElement);

    return () => {
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
      const nestedStyleElement = document.getElementById(nestedStyleId);
      if (nestedStyleElement) {
        nestedStyleElement.remove();
      }
    };
  }, [menuId, colors, fontStyles, itemStyle, styleOnHover, styleOnSelected, styleOnSubMenu, menuItemStyle]);
};
