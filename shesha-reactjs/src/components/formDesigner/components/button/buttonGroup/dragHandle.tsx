import React, { FC } from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { useButtonGroupConfigurator } from '../../../../../providers/buttonGroupConfigurator';

export interface IDragHandleProps {
  id: string;
}

export const DragHandle: FC<IDragHandleProps> = ({ id }) => {
  const { selectItem } = useButtonGroupConfigurator();
  return (
    <div className="sha-button-group-item-drag-handle" onClick={() => selectItem(id)}>
      <MoreOutlined />
    </div>
  );
};

export default DragHandle;
