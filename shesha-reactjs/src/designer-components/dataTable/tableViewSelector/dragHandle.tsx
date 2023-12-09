import { MoreOutlined } from '@ant-design/icons';
import React, { FC } from 'react';
import { useTableViewSelectorConfigurator } from '@/providers/tableViewSelectorConfigurator';

export interface IDragHandleProps {
  id: string;
}

export const DragHandle: FC<IDragHandleProps> = ({ id }) => {
  const { selectItem } = useTableViewSelectorConfigurator();
  return (
    <div className="sha-toolbar-item-drag-handle" onClick={() => selectItem(id)}>
      <MoreOutlined />
    </div>
  );
};

export default DragHandle;
