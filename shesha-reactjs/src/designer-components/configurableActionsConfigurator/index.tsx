import React from 'react';
import { ConfigurableActionConfigurator } from './configurator';
import { getSettings } from './settings';
import { Form } from 'antd';
import { ConfigurableActionConfiguratorComponentDefinition, IConfigurableActionConfiguratorComponentProps } from './interfaces';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { ThunderboltOutlined } from '@ant-design/icons';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';

const ConfigurableActionConfiguratorComponent: ConfigurableActionConfiguratorComponentDefinition = {
  type: 'configurableActionConfigurator',
  name: 'Configurable Action Configurator',
  icon: <ThunderboltOutlined />,
  isInput: true,
  isOutput: true,
  Factory: ({ model }) => {
    if (model.hidden) return null;

    return (
      <Form.Item name={model.propertyName} labelCol={{ span: 0 }} wrapperCol={{ span: 24 }} noStyle>
        <ConfigurableActionConfigurator allowedActions={model?.allowedActions} editorConfig={model} level={1} readOnly={model.readOnly} label={model.label as string} description={model.description} hideLabel={model.hideLabel} />
      </Form.Item>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) => m
    .add<IConfigurableActionConfiguratorComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IConfigurableActionConfiguratorComponentProps>(1, (prev) => migrateVisibility(prev)),
};

export default ConfigurableActionConfiguratorComponent;
