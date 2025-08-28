import { Menu, MenuProps } from "antd";
import React, { FC } from "react";
import { ShaMenuDrawerStyledWrapper } from "./styles";

type MenuItem = Required<MenuProps>["items"][number];

interface IProps {
  items: MenuItem[];
  open: boolean;
  onClose?: (
    e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>
  ) => void;
}

const ShaMenuDrawer: FC<IProps> = ({ items = [], open, onClose }) => (
  <ShaMenuDrawerStyledWrapper
    title="Menu List"
    placement={"left"}
    closable={false}
    onClose={onClose}
    open={open}
  >
    <Menu mode="inline" items={items} />
  </ShaMenuDrawerStyledWrapper>
);

export default ShaMenuDrawer;
