import React, { FC } from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { useItemListConfigurator } from '@/providers';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export interface IDragHandleProps {
  id: string;
}

export const DragHandle: FC<IDragHandleProps> = ({ id }) => {
  const { selectItem } = useItemListConfigurator();
  const { styles } = useStyles();

  const onClick = () => selectItem(id);

  return (
    <div className={styles.shaToolbarItemDragHandle} onClick={onClick}>
      <MoreOutlined />
    </div>
  );
};

export default DragHandle;
