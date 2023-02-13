import React, { FC } from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { useItemListConfigurator } from '../../../../providers';

export interface IDragHandleProps {
  id: string;
}

export const DragHandle: FC<IDragHandleProps> = ({ id }) => {
  const { selectItem } = useItemListConfigurator();

  const onClick = () => selectItem(id);

  return (
    <div className="sha-button-group-item-drag-handle" onClick={onClick}>
      <MoreOutlined />
    </div>
  );
};

export default DragHandle;
