import React, { FC, useState, RefObject } from 'react';
import { Form, Input, InputNumber, Checkbox, Skeleton, Spin } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { useClickatellGetSettings, useClickatellUpdateSettings, ClickatellSettingDto } from 'api/clickatell';
import { CollapsiblePanel, ValidationErrors } from '@shesha/reactjs';

interface IEditProps {
  formRef: RefObject<FormInstance>;
  onSaved?: () => void;
}
interface IEditFormProps extends IEditProps {
  model: ClickatellSettingDto;
}

const SettingsForm: FC<IEditFormProps> = ({ formRef, onSaved, model }) => {
  const { mutate: save, loading: saving, error: savingError } = useClickatellUpdateSettings({});

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
    <CollapsiblePanel header="Clickatell Settings">
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
            name="clickatellHost"
            label="Clickatell Host"
            initialValue={model.clickatellHost}
            rules={[{ required: true, message: 'This field is required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="clickatellApiId"
            label="Api Id"
            initialValue={model.clickatellApiId}
            rules={[{ required: true, message: 'This field is required' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="clickatellApiUsername"
            label="Login"
            initialValue={model.clickatellApiUsername}
            rules={[{ required: true, message: 'This field is required' }]}
          >
            <Input autoComplete="new-password" />
          </Form.Item>

          <Form.Item name="clickatellApiPassword" label="Password" initialValue={model.clickatellApiPassword}>
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            name="singleMessageMaxLength"
            label="Single SMS length"
            initialValue={model.singleMessageMaxLength}
            rules={[{ required: true, message: 'This field is required' }]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            name="messagePartLength"
            label="Message part length (for concatenated messages)"
            initialValue={model.messagePartLength}
            rules={[{ required: true, message: 'This field is required' }]}
          >
            <InputNumber />
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

const ClickatellSettings: FC<IEditProps> = ({ formRef, onSaved }) => {
  const { loading: loading, error: fetchError, data: serverData } = useClickatellGetSettings({});

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

export default ClickatellSettings;
