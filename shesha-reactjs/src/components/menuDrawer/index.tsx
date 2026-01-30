import { Menu, MenuProps } from "antd";
import React, { FC } from "react";
import { ShaMenuDrawerStyledWrapper } from "./styles";
import { ILayoutColor } from "../menu/model";
import { ScopedMenuStyles } from "../menu/styles";
import { convertJsonToCss } from "@/utils";

type MenuItem = Required<MenuProps>["items"][number];

interface IProps {
  items: MenuItem[];
  open: boolean;
  onClose?: (
    e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>,
  ) => void;
  colors?: ILayoutColor;
  fontStyles?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  styleOnHover?: React.CSSProperties;
  styleOnSelected?: React.CSSProperties;
  styleOnSubMenu?: React.CSSProperties;
  menuId?: string;
}

const ShaMenuDrawer: FC<IProps> = ({
  items = [],
  open,
  onClose,
  colors,
  fontStyles,
  itemStyle,
  styleOnHover,
  styleOnSelected,
  styleOnSubMenu,
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
          itemStyle={convertJsonToCss(itemStyle)}
          styleOnHover={convertJsonToCss(styleOnHover)}
          styleOnSelected={convertJsonToCss(styleOnSelected)}
          styleOnSubMenu={convertJsonToCss(styleOnSubMenu)}
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
