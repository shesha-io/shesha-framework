import React, { FC } from 'react';
import { useTheme } from '@/providers';
import { Form, FormItemProps, Input, Space } from 'antd';

const InputStatesPreview: FC = () => {
  const { theme } = useTheme();

  const commonProps: FormItemProps = {
    layout: theme.layout,
    ...(theme.labelAlign ? { labelAlign: theme.labelAlign } : {}),
    labelCol: theme.labelSpan ? { span: theme.labelSpan } : {},
  };

  return (
    <Space>
      <Form.Item {...commonProps} label="Failed" validateStatus="error" help="Please complete before submission">
        <Input placeholder="Placeholder Text" />
      </Form.Item>
      <Form.Item {...commonProps} validateStatus="warning" label="Warning">
        <Input placeholder="Warning Message" prefix={<span style={{ color: '#faad14' }}>⚠</span>} />
      </Form.Item>
      <Form.Item {...commonProps} label="Validating" validateStatus="validating" help="Please wait while we validate your input">
        <Input placeholder="Placeholder Text" />
      </Form.Item>
      <Form.Item {...commonProps} label="Success" validateStatus="success">
        <Input placeholder="Successful Input" />
      </Form.Item>
    </Space>
  );
};

export default InputStatesPreview;
