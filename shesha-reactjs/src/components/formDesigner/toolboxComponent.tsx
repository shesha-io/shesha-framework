import { FC } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { IToolboxComponentBase } from '@/interfaces';
import { Show } from '@/components/show';
import { Space, Tooltip } from 'antd';
import { useStyles } from './styles/styles';
import { COMPONENT_TYPE_ATTR } from './dragDrop/dragChip';

interface IProps {
  component: IToolboxComponentBase;
  index: number;
}

const ToolbarComponent: FC<IProps> = ({ component }) => {
  const { styles } = useStyles();

  return (
    <div className={styles.shaToolboxComponent} {...{ [COMPONENT_TYPE_ATTR]: component.type }}>
      <div>
        {component.icon}
        <Space size="small">
          <span>{component.name}</span>

          <Show when={Boolean(component.tooltip)}>
            <Tooltip title={component.tooltip}>
              <InfoCircleOutlined />
            </Tooltip>
          </Show>
        </Space>
      </div>
    </div>
  );
};

export default ToolbarComponent;
