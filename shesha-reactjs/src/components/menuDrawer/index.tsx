import { DrawerProps, Menu, MenuProps } from "antd";
import React, { FC } from "react";
import { ShaMenuDrawerStyledWrapper } from "./styledDrawer";
import { ILayoutColor } from "../menu/model";
import { ScopedMenuStyles } from "../menu/styles";
import { convertJsonToCss, convertJsonToCssWithImportant } from "@/utils";

type MenuItem = Required<MenuProps>["items"][number];

interface IProps {
  items: MenuItem[];
  open: boolean;
  onClose?: DrawerProps["onClose"] | undefined;
  colors?: ILayoutColor | undefined;
  padding?: { x: number; y: number } | undefined;
  fontStyles?: React.CSSProperties | undefined;
  itemStyle?: React.CSSProperties | undefined;
  styleOnHover?: React.CSSProperties | undefined;
  styleOnSelected?: React.CSSProperties | undefined;
  styleOnSubMenu?: React.CSSProperties | undefined;
  menuItemStyle?: React.CSSProperties | undefined;
  menuId?: string | undefined;
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
      {...(onClose ? { onClose: onClose } : {})}
      open={open}
      {...(menuId ? { className: `horizontal-menu-drawer-${menuId}` } : {})}
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
