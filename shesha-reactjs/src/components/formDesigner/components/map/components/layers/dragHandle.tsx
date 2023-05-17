import React, { FC } from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { useLayerGroupConfigurator } from 'providers/layersConfigurator';

export interface IDragHandleProps {
  id: string;
}

export const DragHandle: FC<IDragHandleProps> = ({ id }) => {
  const { selectItem } = useLayerGroupConfigurator();
  return (
    <div className="sha-button-group-item-drag-handle" onClick={() => selectItem(id)}>
      <MoreOutlined />
    </div>
  );
};

export default DragHandle;
