"use client";

import React, { useState } from 'react';
import { PageWithLayout } from '@/interfaces';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { ListEditor } from '@/components';
import { nanoid } from '@/utils/uuid';
import { Item } from '@/components/modelConfigurator/propertiesEditor/renderer-new/item';
import { ModelItemProperties } from '@/components/modelConfigurator/propertiesEditor/renderer-new/modelItemProperties';
import { Button } from 'antd';
import { syncEntities } from '@/providers/metadataDispatcher/entities/utils';
import { useSyncEntitiesContext } from '@/providers/metadataDispatcher/entities/useSyncEntitiesContext';
import { ListEditorRenderer } from '@/components/listEditorRenderer';

type ItemType = IModelItem;

const Page: PageWithLayout<{}> = () => {
    const [value, setValue] = useState<ItemType[]>();
    const [selectedItem, setSelectedItem] = useState<ItemType>();
    const [readOnly] = useState(false);
    const syncContext = useSyncEntitiesContext();

    const onSelectionChange = (item: ItemType) => {
        setSelectedItem(item);
    };

    const onItemUpdate = (newValues: ItemType) => {
        if (!selectedItem || selectedItem.id !== newValues.id) return;

        Object.assign(selectedItem, newValues);
        setValue([...value]);
    };

    const onSyncClick = () => {
        console.log('LOG: sync entities...');
        syncEntities(syncContext).then(response => {
            console.log('LOG: sync completed', response);
        });
    };

    return (
        <div>
            <h1>Playground</h1>
            <div>
                <Button onClick={onSyncClick}>Sync entities</Button>
            </div>
            <div style={{ padding: "10px 100px", height: "500px", border: "1px solid lightgray" }}>
                <div style={{ border: "1px solid lightgray", height: "100%" }}>
                    <ListEditorRenderer
                        sidebarProps={{
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
                            {({ item, index, nestedRenderer, itemOnChange }) => {
                                return (
                                    <Item
                                        itemProps={item}
                                        index={[index]}
                                        key={item?.id}
                                        onChange={(newValue) => {
                                            //console.log('XX: onChange 2nd level');
                                            itemOnChange({...newValue});
                                        }}
                                        containerRendering={(args) => {
                                            return nestedRenderer({
                                                ...args,
                                                onChange: function (newValue: IModelItem[]): void {
                                                    //console.log('XX: onChange 1st level');
                                                    args.onChange(newValue);
                                                },
                                                initNewItem: function (_items: IModelItem[]): IModelItem {
                                                    return {
                                                        id: nanoid(),
                                                        name: 'New Property',
                                                        label: '',
                                                    };
                                                }
                                            });
                                        }}
                                    />
                                );
                            }}
                        </ListEditor>
                    </ListEditorRenderer>
                </div>
            </div>
        </div>
    );
};

export default Page;