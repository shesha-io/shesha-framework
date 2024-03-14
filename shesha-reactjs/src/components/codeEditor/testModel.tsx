import { AppstoreOutlined, MailOutlined, SettingOutlined } from "@ant-design/icons";
import React from "react";

//type MenuItem = Required<MenuProps>['items'][number];

type MenuItem = {
  label: string;//React.ReactNode,
  key: React.Key;
  icon?: React.ReactNode;
  children?: MenuItem[];
  type?: 'group';
};

function getItem(
  label: string,//React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

export const items: MenuItem[] = [
  getItem('Navigation_One', 'sub1', <MailOutlined />, [
    getItem('Item_1', 'g1', null, [getItem('Option_1', '1'), getItem('Option_2', '2')], 'group'),
    getItem('Item_2', 'g2', null, [getItem('Option_3', '3'), getItem('Option_4', '4')], 'group'),
  ]),

  getItem('Navigation_Two', 'sub2', <AppstoreOutlined />, [
    getItem('Option_5', '5'),
    getItem('Option_6', '6'),
    getItem('Submenu', 'sub3', null, [getItem('Option_7', '7'), getItem('Option_8', '8')]),
  ]),

  getItem('Navigation_Three', 'sub4', <SettingOutlined />, [
    getItem('Option_9', '9'),
    getItem('Option_10', '10'),
    getItem('Option_11', '11'),
    getItem('Option_12', '12'),
  ]),

  getItem('Group', 'grp', null, [getItem('Option_13', '13'), getItem('Option_14', '14')], 'group'),
];
