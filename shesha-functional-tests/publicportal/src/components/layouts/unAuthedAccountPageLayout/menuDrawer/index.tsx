import { ISidebarMenuItem, IconType, ShaIcon } from "@shesha/reactjs";
import { nanoid } from "nanoid";
import { FC } from "react";
import { ShaMenuDrawerWrapper } from "./styles";

interface IProps {
  items: ISidebarMenuItem[];
  open: boolean;
  onClose: (e: React.MouseEvent<Element, MouseEvent>) => void;
}

const ShaMenuDrawer: FC<IProps> = ({ items = [], open, onClose }) => (
  <ShaMenuDrawerWrapper
    key={nanoid()}
    title="Menu List"
    placement={"left"}
    closable={false}
    onClose={onClose}
    open={open}
  >
    {items.map(({ icon, title }) => (
      <div className="menu-item">
        <ShaIcon iconName={icon as IconType} />
        {title}
      </div>
    ))}
  </ShaMenuDrawerWrapper>
);

export default ShaMenuDrawer;
