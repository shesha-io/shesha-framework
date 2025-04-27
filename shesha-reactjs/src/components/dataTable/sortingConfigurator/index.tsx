import { Space, Select } from 'antd';
import { ListEditor, PropertyAutocomplete } from '@/components/index';
import { ColumnSorting, GroupingItem as SortingItem } from '@/providers/dataTable/interfaces';
import React, { FC, useEffect } from 'react';
import { getNanoId } from '@/utils/uuid';

const { Option } = Select;

export interface ISortingEditorProps {
    value?: SortingItem[];
    onChange: (newValue?: SortingItem[]) => void;
    readOnly?: boolean;
    maxItemsCount?: number;
}

export const SortingEditor: FC<ISortingEditorProps> = (props) => {
    const { value, onChange, readOnly: editorReadOnly, maxItemsCount } = props;
    
    // Ensure value is properly initialized when component is first rendered
    useEffect(() => {
        if (value === null || value === undefined) {
            onChange([]);
        } else if (Array.isArray(value)) {
            // Ensure all items have proper structure
            const fixedItems = value.map(item => ({
                id: item.id || getNanoId(),
                propertyName: item.propertyName || '',
                sorting: item.sorting || 'asc'
            }));
            
            // Only update if there were changes
            const needsUpdate = fixedItems.some((item, idx) => 
                !value[idx]?.id || !value[idx]?.sorting
            );
            
            if (needsUpdate) {
                onChange(fixedItems);
            }
        }
    }, []);

    return (
        <ListEditor<SortingItem>
            value={value}
            onChange={onChange}
            initNewItem={(_items) => ({ id: getNanoId(), propertyName: '', sorting: 'asc' })}
            readOnly={editorReadOnly}
            maxItemsCount={maxItemsCount}
            // Make sure each item has proper structure before adding or updating
            onItemChange={(newItem) => {
                if (newItem && !newItem.id) {
                    newItem.id = getNanoId();
                }
                
                if (newItem && !newItem.sorting) {
                    newItem.sorting = 'asc';
                }
                
                return newItem;
            }}
        >
            {({ item, itemOnChange, readOnly }) => {
                return (
                    <div>
                        <Space.Compact style={{ width: '100%' }}>
                            <PropertyAutocomplete
                                style={{ width: 'calc(100% - 120px)' }}
                                mode='single'
                                value={item.propertyName}
                                onChange={(value) => {
                                    if (!Array.isArray(value))
                                        itemOnChange({ ...item, propertyName: value }, undefined);
                                }}
                                autoFillProps={false}
                                size='small'
                                readOnly={readOnly}
                            />
                            <Select<ColumnSorting>
                                value={item.sorting}
                                onChange={(value) => {
                                    itemOnChange({ ...item, sorting: value }, undefined);
                                }}
                                style={{ width: '120px' }}
                                size='small'
                                disabled={readOnly}
                            >
                                <Option value="asc">Ascending</Option>
                                <Option value="desc">Descending</Option>
                            </Select>
                        </Space.Compact>
                    </div>);
            }}
        </ListEditor>
    );
};