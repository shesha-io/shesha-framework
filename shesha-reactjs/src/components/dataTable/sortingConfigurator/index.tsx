import { Space, Select } from 'antd';
import { ListEditor, PropertyAutocomplete } from '@/components/index';
import { ColumnSorting, GroupingItem as SortingItem } from '@/providers/dataTable/interfaces';
import { MetadataProvider } from '@/providers/index';
import React, { FC } from 'react';
import { getNanoId } from '@/utils/uuid';

const { Option } = Select;

export interface ISortingEditorProps {
    value?: SortingItem[];
    onChange: (newValue?: SortingItem[]) => void;
    modelType: string;
    readOnly?: boolean;
}

export const SortingEditor: FC<ISortingEditorProps> = (props) => {
    const { value, onChange, modelType, readOnly: editorReadOnly } = props;
    return (
        <MetadataProvider modelType={modelType}>
            <ListEditor<SortingItem>
                value={value}
                onChange={onChange}
                initNewItem={(_items) => ({ id: getNanoId(), propertyName: '', sorting: 'asc' })}
                readOnly={editorReadOnly}
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
                                            itemOnChange({ ...item, propertyName: value });
                                    }}
                                    showFillPropsButton={false}
                                    size='small'
                                    readOnly={readOnly}
                                />
                                <Select<ColumnSorting>
                                    value={item.sorting}
                                    onChange={(value) => {
                                        itemOnChange({ ...item, sorting: value });
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
        </MetadataProvider>
    );
};