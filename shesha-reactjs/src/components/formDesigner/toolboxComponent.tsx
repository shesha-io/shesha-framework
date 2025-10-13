import React, { FC } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { IToolboxComponent } from '@/interfaces';
import { Show } from '@/components';
import { Space, Tooltip } from 'antd';
import { useStyles } from './styles/styles';

export interface IProps {
  component: IToolboxComponent;
  index: number;
}

const ToolbarComponent: FC<IProps> = ({ component /* , index*/ }) => {
  const { styles } = useStyles();
  const ComponentContent = (): JSX.Element => (
    <div>
      {component.icon}
      <Space size="small">
        <span>{component.name}</span>

        <Show when={Boolean(component?.tooltip)}>
          <Tooltip title={component?.tooltip}>
            <InfoCircleOutlined />
          </Tooltip>
        </Show>
      </Space>
    </div>
  );

  return (
    <div className={styles.shaToolboxComponent}>
      <ComponentContent />
    </div>
  );
};

export default ToolbarComponent;
