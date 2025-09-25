import React from 'react';
import { configurableActionsConfiguratorSettingsForm } from './settings';
import { DynamicActionsConfigurator } from './configurator';
import { IDynamicActionsConfiguratorComponentProps } from './interfaces';
import { IToolboxComponent } from '@/interfaces';
import { ThunderboltOutlined } from '@ant-design/icons';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { ConfigurableFormItem } from '@/components';

export const DynamicActionsConfiguratorComponent: IToolboxComponent<IDynamicActionsConfiguratorComponentProps> = {
  type: 'dynamicItemsConfigurator',
  name: 'Dynamic Items Configurator',
  icon: <ThunderboltOutlined />,
  isInput: true,
  isOutput: true,
  Factory: ({ model }) => {
    if (model.hidden) return null;

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => (
          <DynamicActionsConfigurator editorConfig={model} readOnly={model.readOnly} value={value} onChange={onChange} />
        )}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: configurableActionsConfiguratorSettingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(configurableActionsConfiguratorSettingsForm, model),
};
