import React from 'react';
import { AppEditModeToggler, IToolboxComponent, PERM_APP_CONFIGURATOR, ProtectedContent } from '@/index';
import ConfigurationItemViewModeToggler from '@/components/appConfigurator/configurationItemViewModeToggler';
import { SwapOutlined } from '@ant-design/icons';
import ParentProvider from '@/providers/parentProvider';
import { Space } from 'antd';

const HeaderAppControl: IToolboxComponent = {
  type: 'headerAppControl',
  isInput: false,
  canBeJsSetting: false,
  name: 'Header App Control',
  icon: <SwapOutlined />,
  Factory: ({ model }) => {
    return (
      <ParentProvider model={model}>
        <ProtectedContent permissionName={PERM_APP_CONFIGURATOR}>
          <Space>
            <AppEditModeToggler {...model} />
            <ConfigurationItemViewModeToggler />
          </Space>
        </ProtectedContent>
      </ParentProvider>
    );
  },
};

export default HeaderAppControl;
