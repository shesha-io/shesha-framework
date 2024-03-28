import React, { FC, useState } from 'react';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { ListEditor, SidebarContainer } from '@/components';
import { nanoid } from '@/utils/uuid';
import { Item } from '@/components/modelConfigurator/propertiesEditor/renderer-new/item';
import { ItemsContainer } from '@/components/modelConfigurator/propertiesEditor/renderer-new/itemsContainer';
import { ModelItemProperties } from '@/components/modelConfigurator/propertiesEditor/renderer-new/modelItemProperties';
import { IMetadataEditorProps } from './interfaces';

type ItemType = IModelItem;

export interface IMetadataEditorModalProps extends IMetadataEditorProps {
}

export const MetadataEditorModal: FC<IMetadataEditorModalProps> = ({ value, onChange, readOnly }) => {
    const [selectedItem, setSelectedItem] = useState<ItemType>();

    const onSelectionChange = (item: ItemType) => {
        setSelectedItem(item);
    };

    const setValue = (value: ItemType[]) => {
        onChange(value);
    };

    const onItemUpdate = (newValues: ItemType) => {
        if (!selectedItem || selectedItem.id !== newValues.id) return;

        Object.assign(selectedItem, newValues);
        setValue([...value]);
    };

    return (
        <SidebarContainer
            rightSidebarProps={{
                open: true,
                title: 'Properties',
                content: <ModelItemProperties item={selectedItem} onChange={onItemUpdate} />,
            }}
        >
            <ListEditor<ItemType>
                value={value}
                onChange={setValue}
                initNewItem={(_items) => ({
                    id: nanoid(),
                    name: 'New Property',
                    label: '',
                    value: '',
                })}
                readOnly={readOnly}
                selectionType='single'
                onSelectionChange={onSelectionChange}
            >
                {({ item, index }) => {
                    return (
                        <Item
                            itemProps={item}
                            index={[index]}
                            key={item?.id}
                            containerRendering={(args) => (<ItemsContainer {...args} />)}
                        />
                    );
                }}
            </ListEditor>
        </SidebarContainer>
    );
};