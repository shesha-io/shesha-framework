import React, { FC } from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { usePropertiesEditor } from '../provider';

export interface IDragHandleProps {
  id: string;
}

export const DragHandle: FC<IDragHandleProps> = ({ id }) => {
  const { selectItem } = usePropertiesEditor();
  return (
    <div className="sha-sidebar-item-drag-handle" onClick={() => selectItem(id)}>
      <MoreOutlined />
    </div>
  );
};

export default DragHandle;
