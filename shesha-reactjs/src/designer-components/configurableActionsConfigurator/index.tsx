import React from 'react';
import { IToolboxComponent } from 'interfaces';
import { ThunderboltOutlined } from '@ant-design/icons';
import { Form } from 'antd';
import { useForm } from 'providers';
import { validateConfigurableComponentSettings } from '../..';
import { configurableActionsConfiguratorSettingsForm } from './settings';
import { IConfigurableActionConfiguratorComponentProps } from './interfaces';
import { migratePropertyName, migrateCustomFunctions } from '../../designer-components/_common-migrations/migrateSettings';
import { ConfigurableActionConfigurator } from './configurator';

const ConfigurableActionConfiguratorComponent: IToolboxComponent<IConfigurableActionConfiguratorComponentProps> = {
  type: 'configurableActionConfigurator',
  name: 'Configurable Action Configurator',
  icon: <ThunderboltOutlined />,
  isHidden: true,
  factory: (model: IConfigurableActionConfiguratorComponentProps) => {
    const { formMode } = useForm();

    if (model.hidden) return null;

    return (
      <Form.Item name={model.propertyName} labelCol={{ span: 0 }} wrapperCol={{ span: 24 }} noStyle>
        <ConfigurableActionConfigurator editorConfig={model} level={1} readOnly={formMode === 'readonly'} label={model.label} description={model.description} />
      </Form.Item>
    );
  },
  settingsFormMarkup: configurableActionsConfiguratorSettingsForm,
  validateSettings: model => validateConfigurableComponentSettings(configurableActionsConfiguratorSettingsForm, model),
  migrator: m => m
  .add<IConfigurableActionConfiguratorComponentProps>(0, prev => migratePropertyName(migrateCustomFunctions(prev)))
,
};

export default ConfigurableActionConfiguratorComponent;
