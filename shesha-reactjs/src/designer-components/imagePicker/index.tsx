import React, { useState, useRef } from 'react';
import { DeleteOutlined, FileAddOutlined, SyncOutlined, UploadOutlined } from '@ant-design/icons';
import { App, Button, Space, Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { useStyles } from './style';
import { IToolboxComponent } from '@/interfaces';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import { toBase64, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { isFileTypeAllowed } from '@/utils/fileValidation';
import { IFileUploadProps } from '../fileUpload/interfaces';
import { getSettings } from './settings';

interface IImageUploaderProps {
  onChange: (value: any) => void;
  value: UploadFile;
  readOnly: boolean;
  allowedFileTypes?: string[];
}

export const ImagePicker = ({ onChange, value, readOnly, allowedFileTypes }: IImageUploaderProps): JSX.Element => {
  const [fileList, setFileList] = useState<UploadFile[]>(typeof value == 'string' ? value : value ? [{ ...value }] : []);
  const { styles } = useStyles();
  const { message } = App.useApp();

  const uploadBtnRef = useRef<HTMLButtonElement | null>(null);

  const handleChange: UploadProps['onChange'] = async ({ fileList }) => {
    if (fileList.length > 1) fileList.shift();
    const file = fileList[0];

    if (file?.originFileObj) {
      const base64Image = await toBase64(file.originFileObj as File);
      onChange(base64Image);
      setFileList([{ ...file, url: base64Image, name: "" }]);
    } else {
      onChange({});
      setFileList([]);
    }
  };

  const handleRemove = (): void => {
    setFileList([]);
    onChange('');
  };


  const uploadButton = (
    <Button size="small" ref={uploadBtnRef}>
      {fileList.length === 0 ? <UploadOutlined title="upload" /> : <SyncOutlined title="Replace" />}
    </Button>
  );

  const deleteButton = (
    <Button
      size="small"
      danger
      onClick={(e) => {
        handleRemove();
        e.stopPropagation();
      }}
    >
      <DeleteOutlined title="delete" />
    </Button>
  );

  return (
    <div className={styles.image}>
      <Upload
        listType="text"
        fileList={[]}
        onRemove={handleRemove}
        onChange={handleChange}
        beforeUpload={(file) => {
          if (!isFileTypeAllowed(file.name, allowedFileTypes)) {
            message.error(`File type not allowed. Only ${allowedFileTypes.join(', ')} files are accepted.`);
            return Upload.LIST_IGNORE;
          }
          return false;
        }}
        disabled={readOnly}
        accept={allowedFileTypes?.join(',')}
      >
        <Space>
          {uploadButton}
          {fileList.length !== 0 && deleteButton}
        </Space>
      </Upload>
    </div>
  );
};

const ImagePickerComponent: IToolboxComponent<IFileUploadProps> = {
  type: 'imagePicker',
  name: 'Image Picker',
  icon: <FileAddOutlined />,
  isInput: true,
  isOutput: true,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => {
          return (
            <ImagePicker
              onChange={onChange}
              value={value}
              readOnly={model.readOnly}
              allowedFileTypes={model.allowedFileTypes}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings(),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(), model),
};

export default ImagePickerComponent;
