import { Form, Input, Modal } from 'antd';
import React, { FC } from 'react';

interface IValue {
  finshed?: string;
  active?: string;
  pending?: string;
}

interface ISeqModal {
  open?: boolean;
  onChange?: (values: any) => void;
  onClose: () => void;
  value?: IValue | undefined;
}

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 13 },
};

const StepStatusModal: FC<ISeqModal> = ({ open, onChange, onClose, value: values = {} }) => {
  const [form] = Form.useForm();

  const onFormChange =
    (name: string) =>
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...(values || {}), [name]: value });

  return (
    <Modal open={open} title="Configure Step Status" onCancel={onClose} onOk={onClose}>
      <Form form={form} initialValues={{}} {...formLayout}>
        <Form.Item name="finshed" initialValue={values?.finshed} label="Finished" rules={[{ required: true }]}>
          <Input onChange={onFormChange('finshed')} />
        </Form.Item>

        <Form.Item name="active" initialValue={values?.active} label="Active" rules={[{ required: true }]}>
          <Input onChange={onFormChange('active')} />
        </Form.Item>

        <Form.Item name="pending" initialValue={values?.pending} label="Pending" rules={[{ required: true }]}>
          <Input onChange={onFormChange('pending')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StepStatusModal;
