import React, { FC } from 'react';
import modelSettingsMarkup from '../modelSettings.json';
import { CustomErrorBoundary } from '../..';
import ConfigurableForm from '../../configurableForm';
import { FormMarkup } from '../../../providers/form/models';
import { PropertiesEditorComponent } from '../propertiesEditor';
import { ModelConfiguratorToolbar } from '../toolbar';
import { useModelConfigurator } from '../../..';
import { message } from 'antd';
import { PermissionEditorComponent } from '../permissionEditor';
import { ViewsEditorComponent } from '../viewsEditor';

export interface IModelConfiguratorRendererProps {}

export const ModelConfiguratorRenderer: FC<IModelConfiguratorRendererProps> = () => {
  const { modelConfiguration, form, save, id } = useModelConfigurator();

  const onSettingsSave = values => {
    const dto = { ...values, id };
    save(dto)
      .then(() => message.success('Model saved successfully'))
      .catch(() => message.error('Failed to save model'));
  };

  return (
    <div className="sha-model-configurator">
      {false && <ModelConfiguratorToolbar />}
      <CustomErrorBoundary>
        <ConfigurableForm
          layout="horizontal"
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 13 }}
          mode="edit"
          markup={modelSettingsMarkup as FormMarkup}
          onFinish={onSettingsSave}
          form={form}
          initialValues={modelConfiguration}
          sections={{
            properties: () => <PropertiesEditorComponent />,
            permission: () => <PermissionEditorComponent name="permission" />,
            permissionGet: () => <PermissionEditorComponent name="permissionGet" />,
            permissionCreate: () => <PermissionEditorComponent name="permissionCreate" />,
            permissionUpdate: () => <PermissionEditorComponent name="permissionUpdate" />,
            permissionDelete: () => <PermissionEditorComponent name="permissionDelete" />,
            viewConfigurations: () => <ViewsEditorComponent />
          }}
        />
      </CustomErrorBoundary>
    </div>
  );
};

export default ModelConfiguratorRenderer;
