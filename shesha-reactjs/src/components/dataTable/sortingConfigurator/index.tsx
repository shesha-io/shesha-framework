import { Space, Select } from 'antd';
import { ListEditor, PropertyAutocomplete } from '@/components/index';
import { GroupingItem as SortingItem } from '@/providers/dataTable/interfaces';
import React, { FC, useLayoutEffect, useRef, useState } from 'react';
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


    const containerRef = useRef<HTMLDivElement>(null);
    const [compactMode, setCompactMode] = useState(false);
  
    // Detect when container is too narrow
    useLayoutEffect(() => {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const width = entry.contentRect.width;
          console.log('Observed width:', width);
          setCompactMode(width < 140); 
        }
      });
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      return () => resizeObserver.disconnect();
    }, []);
  

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
                    <div ref={containerRef}>
                       <Space.Compact
                        style={{
                            width: '100%',
                            display: compactMode ? 'grid' : 'flex',
                            gridTemplateColumns: compactMode ? '1fr 1fr' : undefined,
                        }}
                        >
                        <PropertyAutocomplete
                            style={{ width: '100%', minWidth: 30 }}
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

                        <Select
                            value={item.sorting}
                            onChange={(value) =>
                            itemOnChange({ ...item, sorting: value }, undefined)
                            }
                            style={{ minWidth: 70, width: '100%' }}
                            size="small"
                            disabled={readOnly}
                        >
                            <Option value="asc">{'Ascending'}</Option>
                            <Option value="desc">{'Descending'}</Option>
                        </Select>
                        </Space.Compact>

                  </div>);
            }}
        </ListEditor>
    );
};