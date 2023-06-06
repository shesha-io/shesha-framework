import { ISidebarMenuItem, IconType, ShaIcon } from "@shesha/reactjs";
import { FC, Fragment, useState } from "react";
import ShaMenuDrawer from "../menuDrawer";
import { ShaMenuItemWrapper } from "./styles";
import { Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";

interface IProps {
  items: ISidebarMenuItem[];
}

const ShaMenuItem: FC<IProps> = ({ items = [] }) => {
  const [{ open }, setState] = useState({ open: false });

  const onClick = () => setState((s) => ({ ...s, open: true }));

  const onClose = () => setState((s) => ({ ...s, open: false }));

  return (
    <Fragment>
      {items.length <= 3 && (
        <ShaMenuItemWrapper>
          {items.map(({ icon, title }) => (
            <li className="list-item">
              <ShaIcon iconName={icon as IconType} />
              {title}
            </li>
          ))}
        </ShaMenuItemWrapper>
      )}

      {items.length > 3 && (
        <Button type="link" icon={<MenuOutlined />} onClick={onClick} />
      )}

      {items.length > 3 && (
        <ShaMenuDrawer items={items} open={open} onClose={onClose} />
      )}
    </Fragment>
  );
};

export default ShaMenuItem;
