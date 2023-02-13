import { MailOutlined, SettingOutlined } from '@ant-design/icons';
import { TreeSelectProps } from 'antd';
import { Theme } from 'antd/lib/config-provider/context';
import React from 'react';

export const menuItems = [
  {
    key: 'mail',
    icon: <MailOutlined />,
    label: 'Mail',
  },
  {
    key: 'SubMenu',
    icon: <SettingOutlined />,
    label: 'Submenu',
    children: [
      {
        type: 'group',
        label: 'Item 1',
        children: [
          {
            key: 'setting:1',
            label: 'Option 1',
          },
          {
            key: 'setting:2',
            label: 'Option 2',
          },
        ],
      },
    ],
  },
];

export const inputProps = {
  style: { width: 128 },
};

export const selectProps = {
  ...inputProps,
  options: [
    { value: 'light', label: 'Light' },
    { value: 'bamboo', label: 'Bamboo' },
    { value: 'little', label: 'Little' },
  ],
};

export const treeData = [
  {
    value: 'little',
    key: 'little',
    label: 'Little',
    title: 'Little',
    children: [
      { value: 'light', key: 'light', label: 'Light', title: 'Light' },
      { value: 'bamboo', key: 'bamboo', label: 'Bamboo', title: 'Bamboo' },
    ],
  },
];

export const treeSelectProps: TreeSelectProps = {
  ...inputProps,
  treeCheckable: true,
  maxTagCount: 'responsive',
  treeData,
};

export const carTabListNoTitle = [
  {
    key: 'article',
    tab: 'article',
  },
  {
    key: 'app',
    tab: 'app',
  },
  {
    key: 'project',
    tab: 'project',
  },
];

export const customTheme: Theme & { [key: string]: string | number } = {
  primaryColor: '#1890ff',
  errorColor: '#ff4d4f',
  warningColor: '#faad14',
  successColor: '#52c41a',
  infoColor: '#1890ff',
  // outlineColor: '#ff4d4f',
  btnFontWeight: 800,
};
