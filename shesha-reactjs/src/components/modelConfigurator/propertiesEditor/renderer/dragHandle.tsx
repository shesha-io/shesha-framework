import React, { FC } from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { usePropertiesEditor } from '../provider';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export interface IDragHandleProps {
  id: string;
}

export const DragHandle: FC<IDragHandleProps> = ({ id }) => {
  const { styles } = useStyles();
  const { selectItem } = usePropertiesEditor();
  return (
    <div className={styles.shaToolbarItemDragHandle} onClick={() => selectItem(id)}>
      <MoreOutlined />
    </div>
  );
};

export default DragHandle;
