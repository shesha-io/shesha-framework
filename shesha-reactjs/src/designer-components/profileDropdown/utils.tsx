import {
  IButtonItem,
  IConfigurableActionConfiguration,
  IconType,
  IHeaderAction,
  ShaIcon,
  ShaLink,
} from '@/index';
import {
  ButtonGroupItemProps,
  IButtonGroup,
  isGroup,
} from '@/providers/buttonGroupConfigurator/models';
import { IAuthenticator } from '@/providers/auth';
import { LoginOutlined } from '@ant-design/icons';
import { MenuProps } from 'antd';
import { ItemType } from 'antd/es/menu/interface';
import React, { Fragment } from 'react';

type MenuItem = MenuProps['items'][number];

type ItemVisibilityFunc = (item: ButtonGroupItemProps) => boolean;

const filterVisibleItems = (
  items: ButtonGroupItemProps[] = [],
  visibilityChecker: ItemVisibilityFunc,
): ButtonGroupItemProps[] => {
  return items.reduce<ButtonGroupItemProps[]>((acc, item) => {
    if (!visibilityChecker(item)) {
      return acc;
    }

    if (isGroup(item)) {
      const filteredChildren = item.childItems
        ? filterVisibleItems(item.childItems, visibilityChecker)
        : undefined;

      acc.push({ ...item, childItems: filteredChildren });
      return acc;
    }

    acc.push(item);
    return acc;
  }, []);
};

export const getMenuItem = (
  items: ButtonGroupItemProps[] = [],
  execute: (payload: IConfigurableActionConfiguration, dynamicItem?: any) => void,
  visibilityChecker?: ItemVisibilityFunc
): ItemType[] => {
  // Filter items based on visibility if checker is provided
  const visibleItems = visibilityChecker ? filterVisibleItems(items, visibilityChecker) : items;

  return visibleItems.map((item) => {
    const { id, icon, label } = item;
    const childItems = isGroup(item) ? (item as IButtonGroup).childItems : undefined;
    const dynamicItem = (item as any)?.dynamicItem;

    return {
      key: id,
      label: (
        <Fragment>
          {icon && <ShaIcon iconName={icon as IconType} />} {label}
        </Fragment>
      ),
      children: childItems ? getMenuItem(childItems, execute, visibilityChecker) : undefined,
      onClick: () => execute((item as IButtonItem)?.actionConfiguration, dynamicItem),
    };
  });
};

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
