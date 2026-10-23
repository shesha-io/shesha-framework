import { MoreOutlined } from '@ant-design/icons';
import { FC } from 'react';
import { useStyles } from './styles/styles';
import { useRefListItemGroupConfigurator } from '../provider';

interface IDragHandleProps {
  id: string;
}

const DragHandle: FC<IDragHandleProps> = ({ id }) => {
  const { styles } = useStyles();
  const { selectItem } = useRefListItemGroupConfigurator();
  return (
    <div className={styles.shaToolbarItemDragHandle} onClick={() => selectItem(id)}>
      <MoreOutlined />
    </div>
  );
};

export default DragHandle;
