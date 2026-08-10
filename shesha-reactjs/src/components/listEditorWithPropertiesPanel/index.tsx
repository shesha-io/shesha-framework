import React, { useState, useTransition } from 'react';
import { ListItem, ListItemWithId } from '../listEditor/models';
import { ListEditorRenderer } from '../listEditorRenderer';
import { ListEditor, ListEditorChildrenFn, ListEditorSectionRenderingFn } from '../listEditor';
import { Skeleton } from 'antd';
import { DefaultGroupHeader } from './defaultGroupHeader';
import { NoSelection } from './noSelection';
import { isDefined } from '@/utils/nullables';

export interface ItemPropertiesRendererProps<TItem extends ListItem> {
  item: TItem;
  onChange: (newValues: TItem) => void;
  readOnly: boolean;
}

export interface IListEditorWithPropertiesPanelProps<TItem extends ListItemWithId> {
  readOnly: boolean;
  value: TItem[];
  onChange: (newValue: TItem[]) => void;
  header?: React.ReactNode;
  children: ListEditorChildrenFn<TItem>;
  addItemText?: string | undefined;
  groupHeader?: ListEditorSectionRenderingFn<TItem> | undefined;
  initNewItem: (items: TItem[]) => TItem;
  itemProperties: (itemProps: ItemPropertiesRendererProps<TItem>) => React.ReactNode;
  noSelectionProperties?: string | React.ReactElement | undefined;
  isGroup?: ((item: TItem) => boolean) | undefined;
}

/**
 * Helper function to recursively find and update an item in nested groups
 */
const findAndUpdateItemRecursively = <TItem extends ListItemWithId>(
  items: TItem[],
  targetId: string,
  newValues: TItem,
  isGroup: (item: TItem) => boolean,
): { updated: boolean; newItems: TItem[] } => {
  const newItems = [...items];

  for (let i = 0; i < newItems.length; i++) {
    const item = newItems[i];
    if (!isDefined(item))
      continue;

    // Check if this is the item we're looking for
    if (item.id === targetId) {
      newItems[i] = { ...item, ...newValues };
      return { updated: true, newItems };
    }

    // If this is a group with childItems, search recursively
    if (isGroup(item) && item.childItems) {
      const result = findAndUpdateItemRecursively(item.childItems as TItem[], targetId, newValues, isGroup);
      if (result.updated) {
        newItems[i] = { ...item, childItems: result.newItems };
        return { updated: true, newItems };
      }
    }
  }

  return { updated: false, newItems };
};

const isGroupDefault = <TItem extends ListItemWithId>(item: TItem): boolean => {
  return isDefined(item) && "itemType" in item && item.itemType === 'group';
};

export const ListEditorWithPropertiesPanel = <TItem extends ListItemWithId>({
  value,
  onChange,
  readOnly,
  header,
  groupHeader,
  initNewItem,
  children,
  itemProperties,
  noSelectionProperties,
  addItemText,
  isGroup = isGroupDefault,
}: IListEditorWithPropertiesPanelProps<TItem>): React.JSX.Element => {
  const [selectedItem, setSelectedItem] = useState<TItem>();
  const [isPending, startTransition] = useTransition();

  const onSelectionChange = (item: TItem | undefined): void => {
    startTransition(() => {
      setSelectedItem(item);
    });
  };

  const onItemUpdate = (newValues: TItem): void => {
    if (!selectedItem || selectedItem.id !== newValues.id) return;

    const result = findAndUpdateItemRecursively(value, newValues.id, newValues, isGroup);
    if (result.updated) {
      onChange(result.newItems);
    } else {
      console.warn('item not found');
    }
  };

  return (
    <ListEditorRenderer
      sidebarProps={{
        title: 'Properties',
        content: isPending
          ? <Skeleton loading />
          : selectedItem
            ? itemProperties({ item: selectedItem, onChange: onItemUpdate, readOnly: readOnly })
            : !noSelectionProperties || typeof (noSelectionProperties) === 'string'
              ? <NoSelection message="noSelectionProperties" readOnly={readOnly} />
              : noSelectionProperties,
      }}
    >
      {header}
      <ListEditor<TItem>
        value={value}
        onChange={onChange}
        initNewItem={initNewItem}
        readOnly={readOnly}
        selectionType="single"
        onSelectionChange={onSelectionChange}
        header={groupHeader ?? ((headerProps) => (<DefaultGroupHeader {...headerProps} addItemText={addItemText} />))}
      >
        {children}
      </ListEditor>
    </ListEditorRenderer>
  );
};
