import { RightOutlined } from "@ant-design/icons";
import { ISidebarMenuItem, IconType, ShaIcon } from "@shesha/reactjs";
import { Dropdown, Menu, Space } from "antd";
import { nanoid } from "nanoid";
import { useRouter } from "next/router";
import React, { FC } from "react";

interface IProps {
  childItems: ISidebarMenuItem[];
}

const ShaMenuDrawerMenuItem: FC<IProps> = ({ childItems = [] }) => {
  const { push } = useRouter();

  const mapChildren = (child: ISidebarMenuItem[]) => {
    if (Array.isArray(child) && child.length) {
      return child.map(({ childItems, icon, isHidden, target, title }) => ({
        key: nanoid(),
        icon: <ShaIcon iconName={icon as IconType} />,
        label: title,
        disabled: isHidden,
        onClick: () => onClick(target),
        children: mapChildren(childItems),
      }));
    }

    return null;
  };

  const onClick = (target: string) => {
    if (target) push(target);
  };

  const menu = (
    <Menu
      items={childItems.map(
        ({ childItems, icon, isHidden, target, title }) => ({
          key: nanoid(),
          icon: <ShaIcon iconName={icon as IconType} />,
          label: title,
          disabled: isHidden,
          onClick: () => onClick(target),
          children: mapChildren(childItems),
        })
      )}
    />
  );

  return (
    <Dropdown overlay={menu}>
      <a onClick={(e) => e.preventDefault()}>
        <Space>
          <RightOutlined />
        </Space>
      </a>
    </Dropdown>
  );
};

export default ShaMenuDrawerMenuItem;
