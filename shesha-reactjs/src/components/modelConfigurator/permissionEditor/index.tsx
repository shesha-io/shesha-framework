import { ConfigurableForm } from '@/components/configurableForm';
import permissionSettingsMarkup from '../permissionSettings.json';
import React, { FC } from 'react';
import { Form } from 'antd';
import { isEqual } from 'lodash';
import { PermissionDto } from '@/apis/permission';

interface IPermissionEditorComponentProps {
  name: string;
}

interface IPermissionEditorProps extends IPermissionEditorComponentProps {
  value?: PermissionDto;
  onChange?: (value: PermissionDto) => void;
}

const PermissionEditor: FC<IPermissionEditorProps> = (props) => {
  return (
    <ConfigurableForm
      layout="horizontal"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      mode="edit"
      markup={permissionSettingsMarkup as any} // convert to any for using JS settings
      initialValues={props?.value}
      onValuesChange={(v) => {
        const d = { ...props?.value, ...v };
        if (!isEqual(props?.value, d)) {
          props?.onChange(d);
        }
      }}
    />
  );
};

export const PermissionEditorComponent: FC<IPermissionEditorComponentProps> = (props) => {
  return (
    <Form.Item
      name={props.name}
      labelCol={{ span: 0 }}
      wrapperCol={{ span: 24 }}
    >
      <PermissionEditor {...props} />
    </Form.Item>
  );
};
