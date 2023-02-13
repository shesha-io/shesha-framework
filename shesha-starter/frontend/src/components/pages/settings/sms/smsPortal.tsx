import React, { FC, useState, RefObject } from 'react';
import { Form, Input, Checkbox, Skeleton, Spin } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { useSmsPortalGetSettings, useSmsPortalUpdateSettings, SmsPortalSettingsDto } from 'api/smsPortal';
import { CollapsiblePanel, ValidationErrors } from '@shesha/reactjs';

interface IEditProps {
  formRef: RefObject<FormInstance>;
  onSaved?: () => void;
}

interface IEditFormProps extends IEditProps {
  model: SmsPortalSettingsDto;
}

const SettingsForm: FC<IEditFormProps> = ({ formRef, onSaved, model }) => {
  const { mutate: save, loading: saving, error: savingError } = useSmsPortalUpdateSettings({});

  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { span: 10 },
    wrapperCol: { span: 14 },
  };

  const onFinish = (values) => {
    save(values).then(() => {
      if (onSaved) onSaved();
    });
  };

  const [showProxyDetails, setShowProxyDetails] = useState(model?.useProxy);
  const [showProxyCredentials, setShowProxyCredentials] = useState(model?.useDefaultProxyCredentials === false);
  const handleValuesChange = (changed) => {
    if (changed.useProxy !== undefined) setShowProxyDetails(changed.useProxy);
    if (changed.useDefaultProxyCredentials !== undefined) setShowProxyCredentials(!changed.useDefaultProxyCredentials);
  };

  return (
    <CollapsiblePanel header="SMS Portal Settings">
      <ValidationErrors error={savingError} />
      <Spin spinning={saving} tip="Please wait...">
        <Form
          ref={formRef}
          form={form}
          className="table-form"
          layout="horizontal"
          {...formItemLayout}
          onFinish={onFinish}
          onValuesChange={handleValuesChange}
        >
          <Form.Item
            name="host"
            label="Host"
            initialValue={model.host}
            rules={[{ required: true, message: 'This field is required' }]}
          >
            <Input autoFocus />
          </Form.Item>
          <Form.Item
            name="username"
            label="Login"
            initialValue={model.username}
            rules={[{ required: true, message: 'This field is required' }]}
          >
            <Input autoComplete="new-password" />
          </Form.Item>
          <Form.Item name="password" label="Password" initialValue={model.password}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <Form.Item name="useProxy" label="Use Proxy" initialValue={model.useProxy} valuePropName="checked">
            <Checkbox />
          </Form.Item>
          {showProxyDetails && (
            <React.Fragment>
              <Form.Item name="webProxyAddress" label="Proxy Address" initialValue={model.webProxyAddress}>
                <Input />
              </Form.Item>
              <Form.Item
                name="useDefaultProxyCredentials"
                label="Use default credentials"
                initialValue={model.useDefaultProxyCredentials}
                valuePropName="checked"
              >
                <Checkbox />
              </Form.Item>
              {showProxyCredentials && (
                <React.Fragment>
                  <Form.Item name="webProxyUsername" label="Proxy username" initialValue={model.webProxyUsername}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="webProxyPassword" label="Proxy password" initialValue={model.webProxyPassword}>
                    <Input.Password />
                  </Form.Item>
                </React.Fragment>
              )}
            </React.Fragment>
          )}
        </Form>
      </Spin>
    </CollapsiblePanel>
  );
};

const SmsPortalSettings: FC<IEditProps> = ({ formRef, onSaved }) => {
  const { loading: loading, error: fetchError, data: serverData } = useSmsPortalGetSettings({});

  return (
    <React.Fragment>
      {!fetchError}
      <Skeleton loading={loading} active paragraph={{ rows: 7 }}>
        <SettingsForm formRef={formRef} model={serverData?.result} onSaved={onSaved}></SettingsForm>
      </Skeleton>
      <ValidationErrors error={fetchError} />
    </React.Fragment>
  );
};

export default SmsPortalSettings;
