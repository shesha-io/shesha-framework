import { InfoCircleOutlined } from '@ant-design/icons';
import { Space, Tooltip } from 'antd';
import React, { FC } from 'react';
import { Show } from '../..';
import { IToolboxComponent } from '../../interfaces';

export interface IProps {
  component: IToolboxComponent;
  index: number;
}

const ToolbarComponent: FC<IProps> = ({ component /*, index*/ }) => {
  const ComponentContent = () => (
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
    <div className="sha-toolbox-component">
      <ComponentContent />
    </div>
  );
};

export default ToolbarComponent;
