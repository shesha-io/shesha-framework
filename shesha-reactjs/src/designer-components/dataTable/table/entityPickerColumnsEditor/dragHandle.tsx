import { MoreOutlined } from '@ant-design/icons';
import React, { FC } from 'react';
import { useColumnsConfigurator } from '@/providers/datatableColumnsConfigurator';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export interface IDragHandleProps {
  id: string;
}

export const DragHandle: FC<IDragHandleProps> = ({ id }) => {
  const { selectItem } = useColumnsConfigurator();
  const { styles } = useStyles();
  return (
    <div className={styles.shaToolbarItemDragHandle} onClick={() => selectItem(id)}>
      <MoreOutlined />
    </div>
  );
};

export default DragHandle;
