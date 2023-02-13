import { UploadOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Modal } from 'antd';
import Upload, { UploadChangeParam } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import React, { FC, useState } from 'react';
import { useMutate } from 'restful-react';
import { onMessageDisplay } from '../util';

export interface IProps {
  readonly onCancel: () => void;
  readonly onRefresh: () => void;
  readonly visible?: boolean;
}

const ImportConfigModal: FC<IProps> = ({ onCancel, onRefresh, visible }) => {
  const [state, setUploadFile] = useState<UploadChangeParam<UploadFile>>();
  const fileList = state?.fileList || [];

  const { mutate: uploadJSONFileAsync } = useMutate({
    verb: 'POST',
    path: `/api/services/Forms/Import`,
  });

  const onUpload = (uploadFile: UploadChangeParam<UploadFile>) => {
    onMessageDisplay('warn', 'Existing configs with same GUID will be overridden');

    setUploadFile(uploadFile);
  };

  const onOk = () => {
    const formData = new FormData();

    formData.append('file', fileList[0]?.originFileObj);

    onMessageDisplay('loading', 'Config import in progress..');

    uploadJSONFileAsync(formData)
      .then(() => {
        onMessageDisplay('success', 'Configs imported successfully');
        onRefresh();
      })
      .catch(e => onMessageDisplay('error', 'Failed to import configs' + e));
  };

  return (
    <Modal
      title="Upload Import File"
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okButtonProps={{ disabled: !fileList.length }}
    >
      <Form>
        <Form.Item>
          <Alert type="warning" message="Existing configs with same GUID will be overridden" />
        </Form.Item>
        <Form.Item name="file" label="Select File">
          <Upload beforeUpload={() => false} multiple={false} onChange={onUpload}>
            <Button icon={<UploadOutlined />}>Upload</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ImportConfigModal;
