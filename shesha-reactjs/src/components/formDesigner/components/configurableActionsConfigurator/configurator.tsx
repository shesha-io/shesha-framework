import React, { FC } from 'react';
import { Form } from 'antd';
import { IConfigurableActionConfiguration } from '../../../../interfaces/configurableAction';

export interface IConfigurableActionSettingsProps {
  model: IConfigurableActionConfiguration;
  onSave: (model: IConfigurableActionConfiguration) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: IConfigurableActionConfiguration) => void;
}

const ConfigurableActionSettings: FC<IConfigurableActionSettingsProps> = props => {
  const [form] = Form.useForm();

  const onValuesChange = (changedValues, values) => {
    if (props.onValuesChange) props.onValuesChange(changedValues, values);
  };

  return (
    <Form form={form} onFinish={props.onSave} onValuesChange={onValuesChange} labelCol={{ span: 24 }}>
      {/* <Form.Item name="name" initialValue={props.model.name} label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item> */}
    </Form>
  );
};

export default ConfigurableActionSettings;
