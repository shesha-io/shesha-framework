import React, { FC, useEffect, useState } from 'react';
import { Form, Spin, Input, Button, InputNumber, message, Checkbox, Tooltip, Switch } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { CollapsiblePanel, MainLayout, ValidationErrors } from '@shesha/reactjs';
import { useEmailSenderUpdateSmtpSettings, useEmailSenderGetSmtpSettings, SmtpSettingsDto } from 'api/emailSender';

interface IEditFormProps {
  model: SmtpSettingsDto;
}

const EditForm: FC<IEditFormProps> = ({ model }) => {
  const formItemLayout = {
    labelCol: { span: 10 },
    wrapperCol: { span: 14 },
  };

  const { mutate: save, loading: saving, error: savingError } = useEmailSenderUpdateSmtpSettings({});
  const [form] = Form.useForm();

  const onFinish = (values) => {
    save(values).then(() => {
      message.success('Saved successfully');
    });
  };

  const [isEnabled, setIsEnabled] = useState(model.emailsEnabled);
  const [supportSmtpRelay, setSupportSmtpRelay] = useState(model.supportSmtpRelay);
  const handleValuesChange = (values) => {
    if (values.emailsEnabled !== undefined) setIsEnabled(values.emailsEnabled);

    if (values.supportSmtpRelay !== undefined) setSupportSmtpRelay(values.supportSmtpRelay);
  };

  return (
    <Spin spinning={saving} tip="Please wait...">
      {savingError && <ValidationErrors error={savingError} />}
      <Form
        className="table-form"
        layout="horizontal"
        {...formItemLayout}
        form={form}
        onFinish={onFinish}
        onValuesChange={handleValuesChange}
      >
        <CollapsiblePanel header="Common">
          <Form.Item
            name="emailsEnabled"
            label="Emails enabled"
            initialValue={model.emailsEnabled}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="redirectAllMessagesTo"
            label={
              <span>
                Redirect all messages to&nbsp;
                <Tooltip title="Is used for testing purposes only">
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            initialValue={model.redirectAllMessagesTo}
            rules={[{ type: 'email' }]}
          >
            <Input />
          </Form.Item>
        </CollapsiblePanel>
        <CollapsiblePanel header="SMTP">
          <Form.Item
            name="host"
            label="Server"
            initialValue={model.host}
            rules={[{ required: isEnabled, message: 'This field is required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="port"
            label="Port"
            initialValue={model.port}
            rules={[{ required: isEnabled, message: 'This field is required' }]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item name="enableSsl" label="Use SSL" valuePropName="checked" initialValue={model.enableSsl}>
            <Checkbox />
          </Form.Item>
          <Form.Item
            name="userName"
            label="Login"
            initialValue={model.userName}
            rules={[{ required: isEnabled, message: 'This field is required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" initialValue={model.password}>
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="supportSmtpRelay"
            label="Support SMTP relay"
            valuePropName="checked"
            initialValue={model.supportSmtpRelay}
          >
            <Checkbox />
          </Form.Item>

          <Form.Item
            name="defaultFromAddress"
            label="Default `from` address"
            initialValue={model.defaultFromAddress}
            rules={[{ required: isEnabled && supportSmtpRelay, message: 'This field is required' }]}
          >
            <Input disabled={!supportSmtpRelay} />
          </Form.Item>
          <Form.Item
            name="defaultFromDisplayName"
            label="Default `from` display name"
            initialValue={model.defaultFromDisplayName}
          >
            <Input disabled={!supportSmtpRelay} />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </CollapsiblePanel>
      </Form>
    </Spin>
  );
};

const EmailSettings = () => {
  const {
    loading: loading,
    refetch: doFetch,
    error: fetchError,
    data: serverData,
  } = useEmailSenderGetSmtpSettings({
    lazy: true,
  });

  const fetchData = async () => {
    await doFetch();
  };

  // fetch data on page load
  useEffect(() => {
    fetchData();
  }, []);

  const model = serverData?.result;

  return (
    <Spin spinning={loading} tip="Please wait...">
      <MainLayout title="Email" description="">
        {fetchError && <ValidationErrors error={fetchError} />}

        {model && <EditForm model={model} />}
      </MainLayout>
    </Spin>
  );
};

export default EmailSettings;
