import { ISidebarMenuItem, isSidebarGroup } from '@/interfaces/sidebar';
import React, { FC } from 'react';
import { SidebarListGroup } from './sidebarListGroup';
import { SidebarListItem } from './sidebarListItem';
import { NestedItemsRenderingArgs } from '@/components/listEditor';

export interface ISidebarItemCommonProps {
    item: ISidebarMenuItem;
    onChange: (newValue: ISidebarMenuItem) => void;
    index: number[];
    nestedRenderer?: (args: NestedItemsRenderingArgs<ISidebarMenuItem>) => React.ReactNode | null;
    initNewItem: (items: ISidebarMenuItem[]) => ISidebarMenuItem;
}

export const SidebarListItemCommon: FC<ISidebarItemCommonProps> = ({ item, onChange, index, nestedRenderer, initNewItem }) => {
    if (isSidebarGroup(item))
        return (
            <SidebarListGroup
                index={index}
                onChange={onChange}
                key={item.id}
                item={item}
                containerRendering={(args) => {
                    return nestedRenderer({
                        ...args,
                        onChange: function (newValue: ISidebarMenuItem[]): void {
                            args.onChange(newValue);
                        },
                        initNewItem: initNewItem,
                    });
                }}
            />
        );

    return <SidebarListItem key={item.id} item={item} />;
};