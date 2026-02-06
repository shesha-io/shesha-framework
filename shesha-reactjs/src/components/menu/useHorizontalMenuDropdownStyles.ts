import { useLayoutEffect } from 'react';
import { ILayoutColor } from './model';
import { convertJsonToCss, convertJsonToCssWithImportant } from '@/utils';

interface UseHorizontalMenuDropdownStylesProps {
  menuId?: string;
  colors?: ILayoutColor;
  padding?: string;
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
  padding,
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
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item {
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
        margin-right: 10px !important;
        margin-left: 0 !important;
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item:hover,
      .horizontal-menu-${menuId}-dropdown .ant-menu-item:hover {
        color: ${colors?.hoverItemColor || BLACK_CLR} !important;
        background: ${colors?.hoverItemBackground || 'white'} !important;
        ${customStyleOnHover || ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item:hover .anticon,
      .horizontal-menu-${menuId}-dropdown .ant-menu-item:hover .anticon {
        ${!customStyleOnHover ? `color: ${colors?.hoverItemColor || BLACK_CLR} !important;` : ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item.ant-menu-item-selected {
        color: ${colors?.selectedItemColor || BLACK_CLR} !important;
        background: ${colors?.selectedItemBackground || 'white'} !important;
        ${customStyleOnSelected || ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu .ant-menu-submenu-title {
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
        margin-right: 10px !important;
        margin-left: 0 !important;
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu .ant-menu-submenu-title:hover {
        color: ${colors?.hoverItemColor || BLACK_CLR} !important;
        background: ${colors?.hoverItemBackground || 'white'} !important;
        ${customStyleOnHover || ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu .ant-menu-submenu-title:hover .anticon {
        ${!customStyleOnHover ? `color: ${colors?.hoverItemColor || BLACK_CLR} !important;` : ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu.ant-menu-submenu-selected .ant-menu-submenu-title {
        color: ${colors?.selectedItemColor || BLACK_CLR} !important;
        background: ${colors?.selectedItemBackground || 'white'} !important;
        ${customStyleOnSelected || ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item-active {
        color: ${colors?.hoverItemColor || BLACK_CLR};
        background: ${colors?.hoverItemBackground || 'white'} !important;
        ${customStyleOnHover || ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-item-active .anticon {
        ${!customStyleOnHover ? `color: ${colors?.hoverItemColor || BLACK_CLR};` : ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu-active .ant-menu-submenu-title {
        color: ${colors?.hoverItemColor || BLACK_CLR};
        background: ${colors?.hoverItemBackground || 'white'} !important;
        ${customStyleOnHover || ''}
      }

      .horizontal-menu-${menuId}-dropdown .ant-menu .ant-menu-submenu-active .ant-menu-submenu-title .anticon {
        ${!customStyleOnHover ? `color: ${colors?.hoverItemColor || BLACK_CLR};` : ''}
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
        margin-right: 10px !important;
        margin-left: 0 !important;
      }

      .horizontal-menu-${menuId}-dropdown.ant-menu-submenu-popup .ant-menu-item:hover {
        color: ${colors?.hoverItemColor || BLACK_CLR} !important;
        background: ${colors?.hoverItemBackground || 'white'} !important;
        ${customStyleOnHover || ''}
      }

      .horizontal-menu-${menuId}-dropdown.ant-menu-submenu-popup .ant-menu-item:hover .anticon {
        ${!customStyleOnHover ? `color: ${colors?.hoverItemColor || BLACK_CLR} !important;` : ''}
      }

      /* Submenu items (with children) in submenu popups */
      .horizontal-menu-${menuId}-dropdown.ant-menu-submenu-popup .ant-menu-submenu .ant-menu-submenu-title {
        ${customMenuItemStyle || ''}
        ${customItemStyle || ''}
      }

      .horizontal-menu-${menuId}-dropdown.ant-menu-submenu-popup .ant-menu-submenu .ant-menu-submenu-title .anticon {
        margin-right: 10px !important;
        margin-left: 0 !important;
      }

      .horizontal-menu-${menuId}-dropdown.ant-menu-submenu-popup .ant-menu-submenu .ant-menu-submenu-title:hover {
        ${!customStyleOnHover ? `color: ${colors?.hoverItemColor || BLACK_CLR} !important;` : `color: ${colors?.hoverItemColor || BLACK_CLR};`}
        ${!customStyleOnHover ? `background: ${colors?.hoverItemBackground || 'white'} !important;` : ''}
        ${customStyleOnHover || ''}
      }

      .horizontal-menu-${menuId}-dropdown.ant-menu-submenu-popup .ant-menu-submenu .ant-menu-submenu-title:hover .anticon {
        ${!customStyleOnHover ? `color: ${colors?.hoverItemColor || BLACK_CLR} !important;` : ''}
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
  }, [menuId, colors, padding, fontStyles, itemStyle, styleOnHover, styleOnSelected, styleOnSubMenu, menuItemStyle]);
};
