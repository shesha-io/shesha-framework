import { Space } from 'antd';
import React from 'react';
import ConfigurationItemViewModeToggler from '@/components/appConfigurator/configurationItemViewModeToggler';
import { AppEditModeToggler, IToolboxComponent, PERM_APP_CONFIGURATOR, ProtectedContent } from '@/index';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import ParentProvider from '@/providers/parentProvider';
import { SwapOutlined } from '@ant-design/icons';
import { getSettings } from './settingsForm';

const HeaderAppControl: IToolboxComponent = {
  type: 'headerAppControl',
  name: 'Header App Control',
  canBeJsSetting: false,
  icon: <SwapOutlined />,
  Factory: ({ model }) => (
    <ParentProvider model={model}>
      <ProtectedContent permissionName={PERM_APP_CONFIGURATOR}>
        <Space className="sha-header-app-control">
          <AppEditModeToggler {...model} />
          <ConfigurationItemViewModeToggler />
        </Space>
      </ProtectedContent>
    </ParentProvider>
  ),
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default HeaderAppControl;
