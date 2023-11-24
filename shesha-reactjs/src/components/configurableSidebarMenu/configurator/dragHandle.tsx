import React, { FC } from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { useSidebarMenuConfigurator } from '@/providers/sidebarMenuConfigurator';

export interface IDragHandleProps {
  id: string;
}

export const DragHandle: FC<IDragHandleProps> = ({ id }) => {
  const { selectItem } = useSidebarMenuConfigurator();
  return (
    <div className="sha-sidebar-item-drag-handle" onClick={() => selectItem(id)}>
      <MoreOutlined />
    </div>
  );
};

export default DragHandle;
