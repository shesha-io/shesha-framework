import { ShaIcon, IconType } from '@/components/shaIcon';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import {
  ButtonGroupItemProps,
  IButtonGroup,
  isGroup,
  isButtonItem,
} from '@/providers/buttonGroupConfigurator/models';
import { IFullAuditedEntity } from '@/publicJsApis/entities';
import { ItemType } from 'antd/es/menu/interface';
import React, { Fragment } from 'react';

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
  execute: (payload: IConfigurableActionConfiguration, dynamicItem?: IFullAuditedEntity) => void,
  visibilityChecker?: ItemVisibilityFunc,
): ItemType[] => {
  // Filter items based on visibility if checker is provided
  const visibleItems = visibilityChecker ? filterVisibleItems(items, visibilityChecker) : items;

  return visibleItems.map((item) => {
    const { id, icon, label } = item;
    const childItems = isGroup(item) ? (item as IButtonGroup).childItems : undefined;
    const dynamicItem = isButtonItem(item) ? item.dynamicItem : undefined;

    return {
      key: id,
      label: (
        <Fragment>
          {icon && <ShaIcon iconName={icon as IconType} />} {label}
        </Fragment>
      ),
      children: childItems ? getMenuItem(childItems, execute, visibilityChecker) : undefined,
      onClick: () => isButtonItem(item) ? execute(item.actionConfiguration, dynamicItem) : undefined,
    };
  });
};
