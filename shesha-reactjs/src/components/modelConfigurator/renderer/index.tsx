import ConfigurableForm from '@/components/configurableForm';
import modelSettingsMarkup from '../modelSettings.json';
import React, { FC } from 'react';
import { CustomErrorBoundary } from '@/components';
import { FormMarkup } from '@/providers/form/models';
import { message } from 'antd';
import { ModelConfiguratorToolbar } from '../toolbar';
import { PermissionEditorComponent } from '../permissionEditor';
import { PropertiesEditorComponent } from '../propertiesEditor';
import { useModelConfigurator } from '@/providers';
import { ViewsEditorComponent } from '../viewsEditor';
import { useStyles } from '../styles/styles';

export interface IModelConfiguratorRendererProps {}

export const ModelConfiguratorRenderer: FC<IModelConfiguratorRendererProps> = () => {
  const { styles } = useStyles();
  const { modelConfiguration, form, save, id } = useModelConfigurator();

  const onSettingsSave = values => {
    const dto = { ...values, id };
    save(dto)
      .then(() => message.success('Model saved successfully'))
      .catch(() => message.error('Failed to save model'));
  };

  return (
    <div className={styles.shaModelConfigurator}>
      {false && <ModelConfiguratorToolbar />}
      <CustomErrorBoundary>
        <ConfigurableForm
          layout="horizontal"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
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
