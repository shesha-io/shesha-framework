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
    e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>
  ) => void;
  colors?: ILayoutColor;
  fontStyles?: React.CSSProperties;
  styleOnSubMenu?: React.CSSProperties;
  menuId?: string;
}

const ShaMenuDrawer: FC<IProps> = ({ 
  items = [], 
  open, 
  onClose, 
  colors, 
  fontStyles, 
  styleOnSubMenu,
  menuId 
}) => (
  <ShaMenuDrawerStyledWrapper
    title="Menu List"
    placement={"left"}
    closable={false}
    onClose={onClose}
    open={open}
    className={menuId ? `horizontal-menu-drawer-${menuId}` : undefined}
  >
    {colors && menuId && (
      <ScopedMenuStyles
        colors={colors}
        styleOnSubMenu={convertJsonToCss(styleOnSubMenu)}
        fontStyles={fontStyles}
        menuId={menuId}
      />
    )}
    <Menu 
      mode="inline" 
      items={items}
      style={{
        backgroundColor: colors?.itemBackground || 'transparent',
        color: colors?.itemColor,
        fontFamily: fontStyles?.fontFamily,
        fontWeight: fontStyles?.fontWeight,
        textAlign: fontStyles?.textAlign as any,
      }}
    />
  </ShaMenuDrawerStyledWrapper>
);

export default ShaMenuDrawer;
