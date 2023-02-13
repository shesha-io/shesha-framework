import React, { FC } from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { useColumnsConfigurator } from '../../../../../../providers/datatableColumnsConfigurator';

export interface IDragHandleProps {
  id: string;
}

export const DragHandle: FC<IDragHandleProps> = ({ id }) => {
  const { selectItem } = useColumnsConfigurator();
  return (
    <div className="sha-toolbar-item-drag-handle" onClick={() => selectItem(id)}>
      <MoreOutlined />
    </div>
  );
};

export default DragHandle;
