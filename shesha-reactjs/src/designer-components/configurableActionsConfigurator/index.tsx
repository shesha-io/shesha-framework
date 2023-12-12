import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { ThunderboltOutlined } from '@ant-design/icons';
import { Form } from 'antd';
import { useForm } from '@/providers';
import { validateConfigurableComponentSettings } from '@/designer-components/..';
import { configurableActionsConfiguratorSettingsForm } from './settings';
import { IConfigurableActionConfiguratorComponentProps } from './interfaces';
import { migratePropertyName, migrateCustomFunctions } from '@/designer-components/_common-migrations/migrateSettings';
import { ConfigurableActionConfigurator } from './configurator';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';

const ConfigurableActionConfiguratorComponent: IToolboxComponent<IConfigurableActionConfiguratorComponentProps> = {
  type: 'configurableActionConfigurator',
  name: 'Configurable Action Configurator',
  icon: <ThunderboltOutlined />,
  isHidden: false,
  Factory: ({ model }) => {
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
    .add<IConfigurableActionConfiguratorComponentProps>(1, (prev) => migrateVisibility(prev))
  ,
};

export default ConfigurableActionConfiguratorComponent;
