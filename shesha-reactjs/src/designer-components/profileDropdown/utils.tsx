import {
  IButtonGroup,
  IButtonItem,
  IConfigurableActionConfiguration,
  IconType,
  IHeaderAction,
  ShaIcon,
  ShaLink,
} from '@/index';
import { IAuthenticator } from '@/providers/auth';
import { LoginOutlined } from '@ant-design/icons';
import { MenuProps } from 'antd';
import { ItemType } from 'antd/es/menu/interface';
import React, { Fragment } from 'react';

type MenuItem = MenuProps['items'][number];

export const getMenuItem = (
  items: IButtonGroup[] = [],
  execute: (payload: IConfigurableActionConfiguration) => void,
): ItemType[] =>
  items.map(({ childItems, id, icon, label, ...payload }) => ({
    key: id,
    label: (
      <Fragment>
        {icon && <ShaIcon iconName={icon as IconType} />} {label}
      </Fragment>
    ),
    children: childItems ? getMenuItem(childItems, execute) : undefined,
    onClick: () => execute((payload as IButtonItem)?.actionConfiguration),
  }));

export const getAccountMenuItems = (
  accountDropdownListItems: IHeaderAction[],
  logoutUser: IAuthenticator['logoutUser'],
): MenuItem[] => {
  const result = (accountDropdownListItems ?? []).map<MenuItem>(({ icon, text, url: link, onClick }, index) => ({
    key: index,
    onClick: onClick,
    label: link ? (
      <ShaLink icon={icon} linkTo={link}>
        {text}
      </ShaLink>
    ) : (
      <Fragment>{icon}</Fragment>
    ),
  }));

  if (result.length > 0) result.push({ key: 'divider', type: 'divider' });

  result.push({
    key: 'logout',
    onClick: logoutUser,
    label: <><LoginOutlined /> Logout</>,
  });

  return result;
};
