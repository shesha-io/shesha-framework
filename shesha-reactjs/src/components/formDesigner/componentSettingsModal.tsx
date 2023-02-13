import { Modal, Spin, Form, Input, Tabs, Checkbox } from 'antd';
import React from 'react';
import { useMedia } from 'react-use';
import { IConfigurableFormComponent } from '../../providers/form/models';

const { TabPane } = Tabs;

export interface IProps<T extends IConfigurableFormComponent> {
  model: T;
  isVisible: boolean;
  onSave: (model: T) => void;
  onCancel: () => void;
  id: string;
}

function ComponentSettingsModal<T extends IConfigurableFormComponent>({
  isVisible,
  onSave,
  onCancel,
  model,
}: IProps<T>) {
  const isSmall = useMedia('(max-width: 480px)');
  const [form] = Form.useForm();
  const formLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 13 },
  };

  const saving = false;

  const onCancelClick = () => {
    form.resetFields();
    onCancel();
  };

  const onOkClick = () => {
    form.submit();
  };

  const size = 'small';

  return (
    <Modal
      width={isSmall ? '90%' : '60%'}
      open={isVisible}
      title="Settings"
      okText="Save"
      onCancel={onCancelClick}
      onOk={onOkClick}
      confirmLoading={saving}
      maskClosable={false}
    >
      <Spin spinning={saving} tip="Please wait...">
        {/* <ValidationErrors error={error?.data}></ValidationErrors> */}
        <Form form={form} onFinish={onSave} {...formLayout}>
          <Tabs type="card" defaultActiveKey="1" size={size} style={{ marginBottom: 32 }}>
            <TabPane tab="Display" key="1">
              <Form.Item name="name" label="Name" rules={[{ required: true }]} initialValue={model?.name}>
                <Input />
              </Form.Item>
              <Form.Item name="label" label="Label" initialValue={model?.label}>
                <Input />
              </Form.Item>
            </TabPane>
            <TabPane tab="Validation" key="2">
              <Form.Item
                name="required"
                label="Required"
                valuePropName={'checked'}
                initialValue={model?.validate?.required}
              >
                <Checkbox />
              </Form.Item>
            </TabPane>
            <TabPane tab="Conditional" key="3">
              Conditional...
            </TabPane>
          </Tabs>
        </Form>
      </Spin>
    </Modal>
  );
}

export default ComponentSettingsModal;
