import React, { FC } from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { useToolbarConfigurator } from '../../../../../providers/toolbarConfigurator';

export interface IDragHandleProps {
  id: string;
}

export const DragHandle: FC<IDragHandleProps> = ({ id }) => {
  const { selectItem } = useToolbarConfigurator();
  return (
    <div className="sha-toolbar-item-drag-handle" onClick={() => selectItem(id)}>
      <MoreOutlined />
    </div>
  );
};

export default DragHandle;
