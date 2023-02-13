import React, { FC, useEffect } from 'react';
import { Form, Spin, Input, Button, message, InputNumber, Checkbox } from 'antd';
import { CollapsiblePanel, MainLayout, ValidationErrors } from '@shesha/reactjs';
import { useOtpGetSettings, useOtpUpdateSettings, OtpSettingsDto } from 'api/otp';
import { FormInstance } from 'antd/lib/form';

interface IEditFormProps {
  model: OtpSettingsDto;
  form: FormInstance;
  onSubmit: (values: any) => void;
}

const EditForm: FC<IEditFormProps> = ({ form, model, onSubmit }) => {
  const formItemLayout = {
    labelCol: { span: 10 },
    wrapperCol: { span: 14 },
  };

  return (
    <CollapsiblePanel header="Clickatell">
      <Form form={form} onFinish={onSubmit} className="table-form" layout="horizontal" {...formItemLayout}>
        <Form.Item
          label="Password length"
          name="passwordLength"
          initialValue={model.passwordLength}
          rules={[{ required: true, message: 'This field is required' }]}
        >
          <InputNumber autoFocus />
        </Form.Item>

        <Form.Item
          label="Alphabet"
          name="alphabet"
          initialValue={model.alphabet}
          rules={[{ required: true, message: 'This field is required' }]}
        >
          <Input.TextArea rows={4} autoSize={true} />
        </Form.Item>
        <Form.Item
          label="Ignore OTP validation"
          name="ignoreOtpValidation"
          initialValue={model.ignoreOtpValidation}
          valuePropName="checked"
        >
          <Checkbox />
        </Form.Item>

        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form>
    </CollapsiblePanel>
  );
};

const OtpSettings = () => {
  const {
    loading: loading,
    refetch: doFetch,
    error: fetchError,
    data: serverData,
  } = useOtpGetSettings({
    lazy: true,
  });
  const { mutate: save, loading: saving, error: savingError } = useOtpUpdateSettings({});

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
      <MainLayout title="OTP" description="">
        {savingError && <ValidationErrors error={fetchError} />}
        {savingError && <ValidationErrors error={savingError} />}

        {model && <EditForm form={form} model={model} onSubmit={handleSubmit} />}
      </MainLayout>
    </Spin>
  );
};

export default OtpSettings;
