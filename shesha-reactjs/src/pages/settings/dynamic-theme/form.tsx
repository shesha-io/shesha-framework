import { SmileOutlined } from '@ant-design/icons';
import { Button, Form, Input, Space } from 'antd';
import React, { FC } from 'react';

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 24,
    },
    md: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 24,
    },
    md: {
      span: 16,
    },
  },
};

const buttonItemLayout = {
  // wrapperCol: { span: 14, offset: 4 },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 24,
    },
    md: {
      span: 16,
      offset: 8,
    },
  },
};

const FormExample: FC = () => (
  <Form {...formItemLayout}>
    <Form.Item label="Fail" validateStatus="error" help="Should be combination of numbers & alphabets">
      <Input placeholder="unavailable choice" id="error" />
    </Form.Item>

    <Form.Item label="Warning" validateStatus="warning">
      <Input placeholder="Warning" id="warning" prefix={<SmileOutlined />} />
    </Form.Item>

    <Form.Item label="Validating" hasFeedback validateStatus="validating" help="The information is being validated...">
      <Input placeholder="I'm the content is being validated" id="validating" />
    </Form.Item>

    <Form.Item label="Success" hasFeedback validateStatus="success">
      <Input placeholder="I'm the content" id="success" />
    </Form.Item>

    <Form.Item {...buttonItemLayout}>
      <Space>
        <Button type="primary">Primary</Button>
        <Button type="primary" danger>
          Danger
        </Button>
        <Button type="primary" ghost>
          Ghost
        </Button>
        <Button>Default</Button>
      </Space>
    </Form.Item>
  </Form>
);

export default FormExample;
