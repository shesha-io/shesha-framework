import React, { FC } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { IToolboxComponent } from '@/interfaces';
import { Show } from '@/components';
import { Space, Tooltip } from 'antd';

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
