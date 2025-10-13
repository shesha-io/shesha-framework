import { MoreOutlined } from '@ant-design/icons';
import React, { FC } from 'react';
import { useStyles } from './styles/styles';
import { useRefListItemGroupConfigurator } from '../provider';

export interface IDragHandleProps {
  id: string;
}

export const DragHandle: FC<IDragHandleProps> = ({ id }) => {
  const { styles } = useStyles();
  const { selectItem } = useRefListItemGroupConfigurator();
  return (
    <div className={styles.shaToolbarItemDragHandle} onClick={() => selectItem(id)}>
      <MoreOutlined />
    </div>
  );
};

export default DragHandle;
