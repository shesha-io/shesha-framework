import { ListEditor } from '@/components/listEditor';
import { ListItem } from '@/components/listEditor/models';
import React, { FC } from 'react';
import { ISizableColumnProps } from './interfaces';
import { nanoid } from '@/utils/uuid';
import { InputNumber } from 'antd';

export interface IColumnsEditorProps {
  value: ISizableColumnProps[];
  onChange: (value: ISizableColumnProps[]) => void;
  readOnly: boolean;
}

export const ColumnsEditor: FC<IColumnsEditorProps> = ({ value, onChange, readOnly }) => {
  return (
    <ListEditor<ISizableColumnProps & ListItem>
      value={value}
      onChange={onChange}
      initNewItem={(_items) => ({ id: nanoid(), size: 25, components: [] })}
      readOnly={readOnly}
    >
      {({ item, itemOnChange, readOnly }) => {
        return (
          <div>
            <InputNumber
              placeholder="Size"
              title="Size"
              value={item.size}
              disabled={readOnly}
              onChange={(newValue) => {
                itemOnChange({ ...item, size: newValue ?? 0 }, undefined);
              }}
            />
          </div>
        );
      }}
    </ListEditor>
  );
};
