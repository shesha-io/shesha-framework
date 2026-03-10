import { ISidebarMenuItem, isSidebarGroup } from '@/interfaces/sidebar';
import React, { FC } from 'react';
import { SidebarListGroup } from './sidebarListGroup';
import { SidebarListItem } from './sidebarListItem';
import { ItemChangeDetails, NestedItemsRenderingArgs } from '@/components/listEditor';

export interface ISidebarItemCommonProps {
  item: ISidebarMenuItem;
  onChange: (newValue: ISidebarMenuItem, changeDetails: ItemChangeDetails) => void;
  nestedRenderer?: (args: NestedItemsRenderingArgs<ISidebarMenuItem>) => React.ReactNode | null;
  initNewItem: (items: ISidebarMenuItem[]) => ISidebarMenuItem;
}

export const SidebarListItemCommon: FC<ISidebarItemCommonProps> = ({ item, onChange, nestedRenderer, initNewItem }) => {
  if (isSidebarGroup(item))
    return (
      <SidebarListGroup
        onChange={onChange}
        key={item.id}
        item={item}
        containerRendering={(args) => {
          return nestedRenderer({
            ...args,
            initNewItem: initNewItem,
          });
        }}
      />
    );

  return <SidebarListItem key={item.id} item={item} />;
};
