import React, { FC } from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { useSidebarMenuConfigurator } from '@/providers/sidebarMenuConfigurator';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export interface IDragHandleProps {
  id: string;
}

export const DragHandle: FC<IDragHandleProps> = ({ id }) => {
  const { selectItem } = useSidebarMenuConfigurator();
  const { styles } = useStyles();
  return (
    <div className={styles.shaToolbarItemDragHandle} onClick={() => selectItem(id)}>
      <MoreOutlined />
    </div>
  );
};

export default DragHandle;
