import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Space, Tag } from 'antd';

export const DemoForm = ({ initialValues }) => {
  const [form] = Form.useForm();
  const [isModified, setIsModified] = useState(false);
  const [initialFormValues, setInitialFormValues] = useState(initialValues);

  // Set initial values when the component mounts or initialValues prop changes
  useEffect(() => {
    form.setFieldsValue(initialValues);
    setInitialFormValues(initialValues);
    setIsModified(false);
  }, [initialValues, form]);

  // Compare current values with initial values to detect changes
  const handleValuesChange = (_changedValues, allValues) => {
    const hasChanges = Object.keys(allValues).some(
      key => allValues[key] !== initialFormValues[key]
    );
    setIsModified(hasChanges);
  };

  const handleReset = () => {
    form.resetFields();
    setIsModified(false);
  };

  const handleSubmit = values => {
    //console.log('Submitted values:', values);
    // Update initial values after submission if needed
    setInitialFormValues(values);
    setIsModified(false);
  };

    // type FilterFunc = (meta: { touched: boolean; validating: boolean }) => boolean;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Tag color={isModified ? 'orange' : 'green'}>
          {isModified ? 'Modified' : 'Unchanged'}
        </Tag>
      </div>
      
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onValuesChange={handleValuesChange}
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please input your name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" disabled={!isModified}>
              Submit
            </Button>
            <Button htmlType="button" onClick={handleReset} disabled={!isModified}>
              Reset
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};