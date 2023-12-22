import React from 'react';
import { configurableActionsConfiguratorSettingsForm } from './settings';
import { DynamicActionsConfigurator } from './configurator';
import { Form } from 'antd';
import { IDynamicActionsConfiguratorComponentProps } from './interfaces';
import { IToolboxComponent } from '@/interfaces';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useForm } from '@/providers';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';

export const DynamicActionsConfiguratorComponent: IToolboxComponent<IDynamicActionsConfiguratorComponentProps> = {
  type: 'dynamicItemsConfigurator',
  name: 'Dynamic Items Configurator',
  icon: <ThunderboltOutlined />,
  isHidden: false,
  Factory: ({ model }) => {
    const { isComponentHidden, formMode } = useForm();

    const isHidden = isComponentHidden(model);

    if (isHidden) return null;

    return (
      <Form.Item name={model.propertyName} labelCol={{ span: 0 }} wrapperCol={{ span: 24 }} noStyle>
        <DynamicActionsConfigurator editorConfig={model} readOnly={formMode === 'readonly'} />
      </Form.Item>
    );
  },
  settingsFormMarkup: configurableActionsConfiguratorSettingsForm,
  validateSettings: model => validateConfigurableComponentSettings(configurableActionsConfiguratorSettingsForm, model),
};