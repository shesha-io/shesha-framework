import { ConfigurableForm } from '@/components/configurableForm';
import modelSettingsMarkup from '../modelSettings.json';
import React, { FC } from 'react';
import { CustomErrorBoundary } from '@/components';
import { FormMarkup } from '@/providers/form/models';
import { App } from 'antd';
import { PermissionEditorComponent } from '../permissionEditor';
import { PropertiesEditorComponent } from '../propertiesEditor';
import { useModelConfigurator } from '@/providers';
import { ViewsEditorComponent } from '../viewsEditor';
import { useStyles } from '../styles/styles';

const markup = modelSettingsMarkup as FormMarkup;

export const ModelConfiguratorRenderer: FC = () => {
  const { styles } = useStyles();
  const { message } = App.useApp();
  const { modelConfiguration, form, save, id } = useModelConfigurator();

  const onSettingsSave = (values): void => {
    const dto = { ...values, id };
    save(dto)
      .then(() => message.success('Model saved successfully'))
      .catch(() => message.error('Failed to save model'));
  };

  return (
    <div className={styles.shaModelConfigurator}>
      <CustomErrorBoundary>
        <ConfigurableForm
          className={styles.shaModelConfiguratorForm}
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          mode="edit"
          markup={markup}
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
            viewConfigurations: () => <ViewsEditorComponent />,
          }}
        />
      </CustomErrorBoundary>
    </div>
  );
};

export default ModelConfiguratorRenderer;
