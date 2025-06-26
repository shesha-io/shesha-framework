import React, { useState, useTransition } from 'react';
import { ListItem, ListItemWithId } from '../listEditor/models';
import { ListEditorRenderer } from '../listEditorRenderer';
import { ListEditor, ListEditorChildrenFn, ListEditorSectionRenderingFn } from '../listEditor';
import { Skeleton } from 'antd';
import { DefaultGroupHeader } from './defaultGroupHeader';
import { NoSelection } from './noSelection';

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
    addItemText?: string;
    groupHeader?: ListEditorSectionRenderingFn<TItem>;
    initNewItem: (items: TItem[]) => TItem;
    itemProperties: (itemProps: ItemPropertiesRendererProps<TItem>) => React.ReactNode;
    noSelectionProperties?: string | React.ReactElement;
}

/**
 * Helper function to recursively find and update an item in nested groups
 */
const findAndUpdateItemRecursively = <TItem extends ListItemWithId>(
    items: TItem[], 
    targetId: string, 
    newValues: TItem
): { updated: boolean; newItems: TItem[] } => {
    const newItems = [...items];
    
    for (let i = 0; i < newItems.length; i++) {
        const item = newItems[i];
        
        // Check if this is the item we're looking for
        if (item.id === targetId) {
            newItems[i] = { ...item, ...newValues };
            return { updated: true, newItems };
        }
        
        // If this is a group with childItems, search recursively
        if (item.itemType === 'group' && item.childItems) {
            const result = findAndUpdateItemRecursively(item.childItems, targetId, newValues);
            if (result.updated) {
                newItems[i] = { ...item, childItems: result.newItems };
                return { updated: true, newItems };
            }
        }
    }
    
    return { updated: false, newItems };
};

export const ListEditorWithPropertiesPanel = <TItem extends ListItemWithId>({ value, onChange, readOnly, header, groupHeader, initNewItem, children, itemProperties, noSelectionProperties, addItemText }: IListEditorWithPropertiesPanelProps<TItem>) => {
    const [selectedItem, setSelectedItem] = useState<TItem>();
    const [isPending, startTransition] = useTransition();

    const onSelectionChange = (item: TItem) => {
        startTransition(() => {
            setSelectedItem(item);
        });
    };

    const onItemUpdate = (newValues: TItem) => {
        if (!selectedItem || selectedItem.id !== newValues.id) return;

        const result = findAndUpdateItemRecursively(value, newValues.id, newValues);
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
                            ? <NoSelection message='noSelectionProperties' readOnly={readOnly} />
                            : noSelectionProperties,
            }}
        >
            {header}
            <ListEditor<TItem>
                value={value}
                onChange={onChange}
                initNewItem={initNewItem}
                readOnly={readOnly}
                selectionType='single'
                onSelectionChange={onSelectionChange}
                header={groupHeader ?? (groupHeader === undefined ? (headerProps) => (<DefaultGroupHeader {...headerProps} addItemText={addItemText} />) : null)}
            >
                {children}
            </ListEditor>
        </ListEditorRenderer>
    );
};