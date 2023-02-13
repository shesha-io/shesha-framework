import React, { useEffect, FC, useState, useRef } from 'react';
import { Form, Spin, Button, message, Select } from 'antd';
import { usePushNotifiersGetAll } from 'api/pushNotifiers';
import { FormInstance } from 'antd/lib/form';
import { usePushSettingsGetSettings, usePushSettingsUpdateSettings, PushSettingsDto } from 'api/pushSettings';
import { MainLayout, ValidationErrors } from '@shesha/reactjs';
import { FirebaseSettings } from 'components';

interface IClassDropdownProps {
  value?: string;
  displayText?: string;
}

const NotifiersDropdown: FC<IClassDropdownProps> = (props) => {
  const { loading, data: listItems } = usePushNotifiersGetAll({ lazy: false });

  const options = listItems?.result?.map((d) => (
    <Select.Option key={d.uid} value={d.uid}>
      {d.name}
    </Select.Option>
  ));

  const selectProps = { ...props, value: options ? props.value?.toString() : null };

  return (
    <Select
      showSearch
      defaultActiveFirstOption={false}
      showArrow={true}
      filterOption={false}
      notFoundContent={null}
      allowClear={true}
      loading={loading}
      {...selectProps}
    >
      {options}
    </Select>
  );
};

interface ISmsSettingsFormProps {
  model?: PushSettingsDto;
}

const PushSettingsForm: FC<ISmsSettingsFormProps> = ({ model }) => {
  const { mutate: save, loading: saving, error: savingError } = usePushSettingsUpdateSettings({});

  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { span: 10 },
    wrapperCol: { span: 14 },
  };
  const gatewayFormRef = useRef<FormInstance>(null);

  const handleGatewaySettingsSaved = () => {
    const values = form.getFieldsValue(); // already validated
    save(values).then(() => {
      message.success('Saved successfully');
    });
  };

  const onFinish = () => {
    if (gatewayFormRef.current) {
      gatewayFormRef.current.validateFields().then(() => {
        gatewayFormRef.current.submit();
      });
    } else {
      // gateway not selected - save main settings
      handleGatewaySettingsSaved();
    }
  };

  const [pushNotifierId, setPushNotifierId] = useState(model?.pushNotifier);
  const handleValuesChange = (values) => {
    if (values.pushNotifier) setPushNotifierId(values.pushNotifier);
  };

  return (
    <Spin spinning={saving} tip="Please wait...">
      {savingError && <ValidationErrors error={savingError} />}
      <Form
        form={form}
        className="table-form"
        layout="horizontal"
        {...formItemLayout}
        onFinish={onFinish}
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          name="pushNotifier"
          label="Notifier"
          initialValue={model.pushNotifier}
          rules={[{ required: true, message: 'This field is required' }]}
        >
          <NotifiersDropdown />
        </Form.Item>
        <Form.Item labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
          {pushNotifierId === '8DF00E45-1F6D-4CE6-82E8-A4C59497DCAE' && (
            <FirebaseSettings formRef={gatewayFormRef} onSaved={handleGatewaySettingsSaved} />
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};

const PushSettings = () => {
  const {
    loading: loading,
    refetch: doFetch,
    error: fetchError,
    data: serverData,
  } = usePushSettingsGetSettings({
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
      <MainLayout title="Push" description="">
        {fetchError && <ValidationErrors error={fetchError} />}
        {model && <PushSettingsForm model={model} />}
      </MainLayout>
    </Spin>
  );
};

export default PushSettings;
