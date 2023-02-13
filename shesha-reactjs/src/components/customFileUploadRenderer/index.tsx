import React, { FC, useEffect } from 'react';
import Upload, { UploadProps } from 'antd/lib/upload/Upload';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import { Spin, Button } from 'antd';
import { ButtonType } from 'antd/lib/button';

interface IProps extends UploadProps {
  readonly isUploading?: boolean;
  readonly disabled?: boolean;
  readonly hintText?: string;
  readonly buttonType?: ButtonType;
  readonly showUploadIcon?: boolean;
}

export const CustomFileUploadRenderer: FC<IProps> = ({
  disabled,
  isUploading,
  fileList: files,
  buttonType = 'primary',
  hintText = 'Select File',
  showUploadIcon = true,
  ...restProps
}) => {
  let hasFiles = files && !!files.length;
  useEffect(() => {
    hasFiles = files && !!files.length;
  }, [files]);
  // Make sure every file that comes in here has a uid. Else, this will just fail
  const fileList = hasFiles
    ? files.map(
        (
          // @ts-ignore
          { id, uid, ...rest }
        ) => {
          return {
            id,
            ...rest,
            uid: id || uid,
          };
        }
      )
    : files;
  const onChange = data => {
    console.log(data);
  };
  return (
    <div className="custom-file-upload-renderer">
      <Upload {...{ ...restProps, fileList }} onChange={onChange} className={`upload ${hasFiles ? 'has-file' : ''}`}>
        <Button hidden={hasFiles} size="small" disabled={isUploading || disabled} type={buttonType}>
          {isUploading ? (
            <span style={{ color: '#ff9d38' }}>
              <Spin size="default" indicator={<LoadingOutlined type="loading" spin />} /> Processing...
            </span>
          ) : (
            <>
              {showUploadIcon && <UploadOutlined />} {hintText}
            </>
          )}
        </Button>
      </Upload>
    </div>
  );
};

export default CustomFileUploadRenderer;
