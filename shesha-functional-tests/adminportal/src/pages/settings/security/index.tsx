import React, { FC, useEffect } from 'react';
import { Form, Spin, Button, Checkbox, InputNumber, message, Row, Col } from 'antd';
import {
  useAuthorizationSettingsGetSettings,
  useAuthorizationSettingsUpdateSettings,
  AuthorizationSettingsDto,
} from 'api/authorizationSettings';
import { FormInstance } from 'antd/lib/form';
import { CollapsiblePanel, MainLayout, ValidationErrors } from '@shesha/reactjs';

interface IEditFormProps {
  form: FormInstance;
  model: AuthorizationSettingsDto;
  onSubmit: (values: any) => void;
}

const EditForm: FC<IEditFormProps> = ({ form, model, onSubmit }) => {
  const formItemLayout = {
    labelCol: { span: 10 },
    wrapperCol: { span: 14 },
  };

  const handleSubmit = (values) => {
    onSubmit(values);
  };

  return (
    <Form className="table-form" layout="horizontal" form={form} {...formItemLayout} onFinish={handleSubmit}>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={24} md={24} lg={24} xl={12}>
          <CollapsiblePanel header="Logon">
            <Form.Item
              label="Lockout Enabled"
              name="isLockoutEnabled"
              valuePropName="checked"
              initialValue={model.isLockoutEnabled}
            >
              <Checkbox />
            </Form.Item>
            <Form.Item
              label="Lockout time (seconds)"
              name="defaultAccountLockoutSeconds"
              initialValue={model.defaultAccountLockoutSeconds}
              rules={[{ required: true, message: 'This field is required' }]}
            >
              <InputNumber />
            </Form.Item>
            <Form.Item
              label="Max failed logon attempts before lockout"
              name="maxFailedAccessAttemptsBeforeLockout"
              initialValue={model.maxFailedAccessAttemptsBeforeLockout}
              rules={[{ required: true, message: 'This field is required' }]}
            >
              <InputNumber />
            </Form.Item>
            <Form.Item
              label="Auto logoff timeout (seconds)"
              name="autoLogoffTimeout"
              initialValue={model.autoLogoffTimeout}
              rules={[{ required: true, message: 'This field is required' }]}
            >
              <InputNumber />
            </Form.Item>
          </CollapsiblePanel>
        </Col>

        <Col xs={24} sm={24} md={24} lg={24} xl={12}>
          <CollapsiblePanel header="Password complexity">
            <Form.Item
              label="Min length"
              name="requiredLength"
              initialValue={model.requiredLength}
              rules={[{ required: true, message: 'This field is required' }]}
            >
              <InputNumber />
            </Form.Item>
            <Form.Item
              label="Require digit"
              name="requireDigit"
              valuePropName="checked"
              initialValue={model.requireDigit}
            >
              <Checkbox />
            </Form.Item>
            <Form.Item
              label="Require lower case character"
              name="requireLowercase"
              valuePropName="checked"
              initialValue={model.requireLowercase}
            >
              <Checkbox />
            </Form.Item>
            <Form.Item
              label="Require upper case character"
              name="requireUppercase"
              valuePropName="checked"
              initialValue={model.requireUppercase}
            >
              <Checkbox />
            </Form.Item>
            <Form.Item
              label="Require non alphanumeric character"
              name="requireNonAlphanumeric"
              valuePropName="checked"
              initialValue={model.requireNonAlphanumeric}
            >
              <Checkbox />
            </Form.Item>
          </CollapsiblePanel>
        </Col>
      </Row>

      <Button type="primary" htmlType="submit">
        Save
      </Button>
    </Form>
  );
};

const LogonSettings = () => {
  const {
    loading: loading,
    refetch: doFetch,
    error: fetchError,
    data: serverData,
  } = useAuthorizationSettingsGetSettings({
    lazy: true,
  });
  const { mutate: save, loading: saving, error: savingError } = useAuthorizationSettingsUpdateSettings({});

  const fetchData = async () => {
    await doFetch();
  };

  const [form] = Form.useForm();

  // fetch data on page load
  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = (values) => {
    save(values).then(() => {
      message.success('Saved successfully');
    });
  };

  const model = serverData?.result;

  return (
    <Spin spinning={loading || saving} tip="Please wait...">
      <MainLayout title="Security" description="">
        {savingError && <ValidationErrors error={fetchError} />}
        {savingError && <ValidationErrors error={savingError} />}

        {model && <EditForm form={form} model={model} onSubmit={handleSubmit} />}
      </MainLayout>
    </Spin>
  );
};

export default LogonSettings;
