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
        }
    }, []);

    const handleItemChange = (newItem: SortingItem, originalItem?: SortingItem) => {
        // Make sure properties are properly set
        if (newItem && !newItem.id) {
            newItem.id = getNanoId();
        }
        
        if (newItem && !newItem.sorting) {
            newItem.sorting = 'asc';
        }
    };

    return (
        <ListEditor<SortingItem>
            value={value}
            onChange={onChange}
            initNewItem={(_items) => ({ id: getNanoId(), propertyName: '', sorting: 'asc' })}
            readOnly={editorReadOnly}
            maxItemsCount={maxItemsCount}
            onItemChange={handleItemChange}
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