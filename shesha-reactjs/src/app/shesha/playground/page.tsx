"use client";

import React, { useState } from 'react';
import { PageWithLayout } from '@/interfaces';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { ListEditor, SidebarContainer } from '@/components';
import { nanoid } from '@/utils/uuid';
import { Item } from '@/components/modelConfigurator/propertiesEditor/renderer-new/item';
import { ItemsContainer } from '@/components/modelConfigurator/propertiesEditor/renderer-new/itemsContainer';
import { ModelItemProperties } from '@/components/modelConfigurator/propertiesEditor/renderer-new/modelItemProperties';

type ItemType = IModelItem;

const Page: PageWithLayout<{}> = () => {
    const [value, setValue] = useState<ItemType[]>();
    const [selectedItem, setSelectedItem] = useState<ItemType>();
    const [readOnly] = useState(false);

    const onSelectionChange = (item: ItemType) => {
        console.log('LOG: on select', item);
        setSelectedItem(item);
    };

    const onItemUpdate = (newValues: ItemType) => {
        if (!selectedItem || selectedItem.id !== newValues.id) return;

        Object.assign(selectedItem, newValues);
        setValue([...value]);
    };

    return (
        <div>
            <h1>Playground</h1>
            <div style={{ padding: "10px 100px" }}>
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
            </div>
        </div>
    );
};

export default Page;