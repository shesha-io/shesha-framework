import React, { FC } from 'react';
import { ISidebarMenuItem } from '@/interfaces/sidebar';
import { nanoid } from '@/utils/uuid';
import { ListEditorWithPropertiesPanel } from '@/components/listEditorWithPropertiesPanel';
import { ItemGroupHeader } from './itemGroupHeader';
import { SidebarItemProperties } from './itemProperties';
import { SidebarListItemCommon } from './sidebarListItemCommon';
import { Alert } from 'antd';

type SidebarConfigItem = ISidebarMenuItem & { itemType?: 'item' | 'group' };

export interface ISidebarConfiguratorProps {
  readOnly: boolean;
  value: ISidebarMenuItem[];
  onChange: (newValue: ISidebarMenuItem[]) => void;
}

export const SidebarConfigurator: FC<ISidebarConfiguratorProps> = ({ value, onChange, readOnly }) => {
  const makeNewItem = (items: ISidebarMenuItem[]): ISidebarMenuItem => {
    const itemsCount = (items ?? []).length;
    const itemNo = itemsCount + 1;

    const newItem: ISidebarMenuItem = {
      id: nanoid(),
      itemType: 'button',
      title: `New item ${itemNo}`,
    };

    return newItem;
  };
  return (
    <ListEditorWithPropertiesPanel<SidebarConfigItem>
      value={value as SidebarConfigItem[]}
      onChange={onChange as (newValue: SidebarConfigItem[]) => void}
      initNewItem={makeNewItem as (items: SidebarConfigItem[]) => SidebarConfigItem}
      readOnly={readOnly}
      header={<Alert message={readOnly ? 'Here you can view sidebar configuration.' : 'Here you can configure the sidebar menu items by adjusting their settings and ordering.'} />}
      itemProperties={(itemProps) => (<SidebarItemProperties item={itemProps.item} onChange={itemProps.onChange} readOnly={itemProps.readOnly} />)}
      groupHeader={ItemGroupHeader}      
    >
      {({ item, itemOnChange, nestedRenderer }) => (
        <SidebarListItemCommon
          item={item}
          onChange={itemOnChange}
          nestedRenderer={nestedRenderer}
          initNewItem={makeNewItem}
        />
      )}
    </ListEditorWithPropertiesPanel>
  );
};