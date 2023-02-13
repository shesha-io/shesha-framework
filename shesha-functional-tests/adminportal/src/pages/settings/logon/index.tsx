import React, { FC, useEffect } from 'react';
import { Form, Spin, Input, Button, Checkbox, InputNumber, message } from 'antd';
import { useLdapUpdateSettings, useLdapGetSettings, LdapSettingsDto } from 'api/ldap';
import { FormInstance } from 'antd/lib/form';
import { CollapsiblePanel, MainLayout, ValidationErrors } from '@shesha/reactjs';

interface IEditFormProps {
  form: FormInstance;
  model: LdapSettingsDto;
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

  const isEnabled = form.getFieldValue('isEnabled');

  return (
    <CollapsiblePanel header="LDAP">
      <Form className="table-form" layout="horizontal" form={form} {...formItemLayout} onFinish={handleSubmit}>
        <Form.Item
          label="Use LDAP authentication"
          name="isEnabled"
          valuePropName="checked"
          initialValue={model.isEnabled}
        >
          <Checkbox />
        </Form.Item>
        <Form.Item
          label="Server"
          name="server"
          initialValue={model.server}
          rules={[{ required: isEnabled, message: 'This field is required' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Domain"
          name="domain"
          initialValue={model.domain}
          rules={[{ required: isEnabled, message: 'This field is required' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Port"
          name="port"
          initialValue={model.port}
          rules={[{ required: isEnabled, message: 'This field is required' }]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item label="Use SSL" name="useSsl" valuePropName={'checked'} initialValue={model.useSsl}>
          <Checkbox />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form>
    </CollapsiblePanel>
  );
};

const LogonSettings = () => {
  const {
    loading: loading,
    refetch: doFetch,
    error: fetchError,
    data: serverData,
  } = useLdapGetSettings({
    lazy: true,
  });
  const { mutate: save, loading: saving, error: savingError } = useLdapUpdateSettings({});

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
      <MainLayout title="Logon" description="">
        {savingError && <ValidationErrors error={fetchError} />}
        {savingError && <ValidationErrors error={savingError} />}

        {model && <EditForm form={form} model={model} onSubmit={handleSubmit} />}
      </MainLayout>
    </Spin>
  );
};

export default LogonSettings;
