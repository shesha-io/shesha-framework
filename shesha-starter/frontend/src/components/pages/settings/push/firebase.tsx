import React, { FC, RefObject } from 'react';
import { Form } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { CollapsiblePanel } from '@shesha/reactjs';

interface IEditProps {
  formRef: RefObject<FormInstance>;
  onSaved?: () => void;
}

interface ISettingsFormProps extends IEditProps {}

const SettingsForm: FC<ISettingsFormProps> = ({ formRef, onSaved }) => {
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { span: 10 },
    wrapperCol: { span: 14 },
  };

  const onFinish = (_values) => {
    if (onSaved) onSaved();
  };

  return (
    <CollapsiblePanel header="Firebase Settings">
      <Form
        ref={formRef}
        form={form}
        className="table-form"
        layout="horizontal"
        onFinish={onFinish}
        {...formItemLayout}
      >
        <Form.Item label="Service account json">
          {/* <StoredFileProvider fileId={fileId} baseUrl={BASE_URL}>
            <FileUpload accept=".json"></FileUpload>
          </StoredFileProvider> */}
        </Form.Item>
      </Form>
    </CollapsiblePanel>
  );
};

const FirebaseSettings: FC<IEditProps> = ({ formRef, onSaved }) => {
  return (
    <React.Fragment>
      <SettingsForm formRef={formRef} onSaved={onSaved}></SettingsForm>
    </React.Fragment>
  );
};

export default FirebaseSettings;
