import { Menu, MenuProps } from "antd";
import React, { FC } from "react";
import { ShaMenuDrawerStyledWrapper } from "./styles";
import { ILayoutColor } from "../menu/model";
import { ScopedMenuStyles } from "../menu/styles";
import { convertJsonToCss, convertJsonToCssWithImportant } from "@/utils";

type MenuItem = Required<MenuProps>["items"][number];

interface IProps {
  items: MenuItem[];
  open: boolean;
  onClose?: (
    e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>,
  ) => void;
  colors?: ILayoutColor;
  padding?: { x: number; y: number };
  fontStyles?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  styleOnHover?: React.CSSProperties;
  styleOnSelected?: React.CSSProperties;
  styleOnSubMenu?: React.CSSProperties;
  menuItemStyle?: React.CSSProperties;
  menuId?: string;
}

const ShaMenuDrawer: FC<IProps> = ({
  items = [],
  open,
  onClose,
  colors,
  padding,
  fontStyles,
  itemStyle,
  styleOnHover,
  styleOnSelected,
  styleOnSubMenu,
  menuItemStyle,
  menuId,
}) => {
  const backgroundColor = itemStyle?.backgroundColor || colors?.itemBackground || 'transparent';
  const textAlign = typeof fontStyles?.textAlign === 'string' ? fontStyles.textAlign : undefined;

  return (
    <ShaMenuDrawerStyledWrapper
      title=""
      placement="left"
      closable={false}
      onClose={onClose}
      open={open}
      className={menuId ? `horizontal-menu-drawer-${menuId}` : undefined}
      styles={{
        body: {
          backgroundColor,
          padding: 0,
        },
        header: {
          backgroundColor,
          color: colors?.itemColor,
          fontFamily: fontStyles?.fontFamily,
          fontWeight: fontStyles?.fontWeight,
          textAlign,
          borderBottom: 'none',
        },
      }}
      style={{
        backgroundColor,
      }}
    >
      {colors && menuId && (
        <ScopedMenuStyles
          colors={colors}
          padding={padding}
          itemStyle={convertJsonToCss(itemStyle)}
          styleOnHover={convertJsonToCssWithImportant(styleOnHover)}
          styleOnSelected={convertJsonToCssWithImportant(styleOnSelected)}
          styleOnSubMenu={convertJsonToCssWithImportant(styleOnSubMenu)}
          menuItemStyle={convertJsonToCss(menuItemStyle)}
          fontStyles={fontStyles}
          menuId={menuId}
        />
      )}
      <Menu
        mode="inline"
        items={items}
        style={{
          backgroundColor,
          color: colors?.itemColor,
          fontFamily: fontStyles?.fontFamily,
          fontWeight: fontStyles?.fontWeight,
          textAlign,
          border: 'none',
        }}
      />
    </ShaMenuDrawerStyledWrapper>
  );
};

export default ShaMenuDrawer;
