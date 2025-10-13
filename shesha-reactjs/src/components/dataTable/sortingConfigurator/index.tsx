import { Space, Select } from 'antd';
import { ListEditor, PropertyAutocomplete } from '@/components/index';
import { ColumnSorting, GroupingItem as SortingItem } from '@/providers/dataTable/interfaces';
import React, { FC } from 'react';
import { getNanoId } from '@/utils/uuid';
import { ListItem } from '@/components/listEditor/models';

const { Option } = Select;

export interface ISortingEditorProps {
  value?: SortingItem[];
  onChange: (newValue?: SortingItem[]) => void;
  readOnly?: boolean;
  maxItemsCount?: number;
}

export const SortingEditor: FC<ISortingEditorProps> = (props) => {
  const { value, onChange, readOnly: editorReadOnly, maxItemsCount } = props;
  return (
    <ListEditor<SortingItem & ListItem>
      value={value}
      onChange={onChange}
      initNewItem={(_items) => ({ id: getNanoId(), propertyName: '', sorting: 'asc', itemType: 'item' })}
      readOnly={editorReadOnly}
      maxItemsCount={maxItemsCount}
    >
      {({ item, itemOnChange, readOnly }) => {
        return (
          <div>
            <Space.Compact style={{ width: '90%', minWidth: '20px' }}>
              <PropertyAutocomplete
                style={{ width: 'calc(100% - 20px)' }}
                mode="single"
                value={item.propertyName}
                onChange={(value) => {
                  if (!Array.isArray(value))
                    itemOnChange({ ...item, propertyName: value }, undefined);
                }}
                autoFillProps={false}
                size="small"
                readOnly={readOnly}
              />
              <Select<ColumnSorting>
                value={item.sorting}
                onChange={(value) => {
                  itemOnChange({ ...item, sorting: value }, undefined);
                }}
                size="small"
                disabled={readOnly}
              >
                <Option value="asc">Ascending</Option>
                <Option value="desc">Descending</Option>
              </Select>
            </Space.Compact>
          </div>
        );
      }}
    </ListEditor>
  );
};
