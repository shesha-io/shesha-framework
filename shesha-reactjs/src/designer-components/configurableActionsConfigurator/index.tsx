import React from 'react';
import { ConfigurableActionConfigurator } from './configurator';
import { configurableActionsConfiguratorSettingsForm } from './settings';
import { Form } from 'antd';
import { IConfigurableActionConfiguratorComponentProps } from './interfaces';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { ThunderboltOutlined } from '@ant-design/icons';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';

const ConfigurableActionConfiguratorComponent: IToolboxComponent<IConfigurableActionConfiguratorComponentProps> = {
  type: 'configurableActionConfigurator',
  name: 'Configurable Action Configurator',
  icon: <ThunderboltOutlined />,
  isInput: true,
  isOutput: true,
  Factory: ({ model }) => {
    if (model.hidden) return null;

    return (
      <Form.Item name={model.propertyName} labelCol={{ span: 0 }} wrapperCol={{ span: 24 }} noStyle>
        <ConfigurableActionConfigurator allowedActions={model?.allowedActions} editorConfig={model} level={1} readOnly={model.readOnly} label={model.label as string} description={model.description} />
      </Form.Item>
    );
  },
  settingsFormMarkup: configurableActionsConfiguratorSettingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(configurableActionsConfiguratorSettingsForm, model),
  migrator: (m) => m
    .add<IConfigurableActionConfiguratorComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IConfigurableActionConfiguratorComponentProps>(1, (prev) => migrateVisibility(prev)),
};

export default ConfigurableActionConfiguratorComponent;
