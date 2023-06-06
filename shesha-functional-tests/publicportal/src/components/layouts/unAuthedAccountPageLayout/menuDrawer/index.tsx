import { ISidebarMenuItem, IconType, ShaIcon } from "@shesha/reactjs";
import { nanoid } from "nanoid";
import React, { FC } from "react";
import ShaMenuDrawerMenuItem from "./menuItem";
import { ShaMenuDrawerStyledWrapper } from "./styles";
import ShaMenuDrawerWrapper from "./wrapper";

interface IProps {
  items: ISidebarMenuItem[];
  open: boolean;
  onClose: (e: React.MouseEvent<Element, MouseEvent>) => void;
}

const ShaMenuDrawer: FC<IProps> = ({ items = [], open, onClose }) => (
  <ShaMenuDrawerStyledWrapper
    key={nanoid()}
    title="Menu List"
    placement={"left"}
    closable={false}
    onClose={onClose}
    open={open}
  >
    {items.map(({ childItems, icon, target, title }) => (
      <ShaMenuDrawerWrapper target={target}>
        <span>
          <ShaIcon className="sha-icon" iconName={icon as IconType} />
          {title}
        </span>

        {!!childItems.length && (
          <ShaMenuDrawerMenuItem childItems={childItems} />
        )}
      </ShaMenuDrawerWrapper>
    ))}
  </ShaMenuDrawerStyledWrapper>
);

export default ShaMenuDrawer;
