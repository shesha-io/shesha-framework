import { MoreOutlined } from '@ant-design/icons';
import { FC } from 'react';
import { useStyles } from './styles/styles';
import { useLayerGroupConfigurator } from '@/providers/layersProvider';

interface IDragHandleProps {
  id: string;
}

const DragHandle: FC<IDragHandleProps> = ({ id }) => {
  const { styles } = useStyles();
  const { selectItem } = useLayerGroupConfigurator();
  return (
    <div className={styles.shaToolbarItemDragHandle} onClick={() => selectItem(id)}>
      <MoreOutlined />
    </div>
  );
};

export default DragHandle;
