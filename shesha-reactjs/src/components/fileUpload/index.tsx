import React, { FC, useRef } from 'react';
import { useStoredFile } from '../../providers';
import { Upload, message, Button } from 'antd';
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import { InfoCircleOutlined, SyncOutlined, DeleteOutlined, LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import { UploadProps } from 'antd/lib/upload/Upload';
import filesize from 'filesize';
import { FileVersionsPopup } from './fileVersionsPopup';
import './styles/styles.less';

export interface IFileUploadProps {
  allowUpload?: boolean;
  allowReplace?: boolean;
  allowDelete?: boolean;
  accept?: string;
  callback?: (...args: any) => any;

  value?: any;
  onChange?: any;
  /* isStub is used just to fix strange error when the user is reordering components on the form */
  isStub?: boolean;
}

export const FileUpload: FC<IFileUploadProps> = ({
  allowUpload = true,
  allowReplace = true,
  allowDelete = true,
  //uploadMode = 'async',
  accept,
  callback,
  isStub = false, 
}) => {
  const {
    fileInfo,
    downloadFile,
    deleteFile,
    uploadFile,
    isInProgress: { uploadFile: isUploading },
    /*
    succeeded: { downloadZip: downloadZipSuccess },
    */
  } = useStoredFile();
  const uploadButtonRef = useRef(null);
  //console.log(uploadMode);

  const onCustomRequest = ({ file /*, onError, onSuccess*/ }: RcCustomRequestOptions) => {
    // call action from context
    uploadFile({ file: file as File }, callback);
  };

  const onDownloadClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    downloadFile({ fileId: fileInfo.id, fileName: fileInfo.name });
  };

  const onReplaceClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    uploadButtonRef.current.click();
  };

  const onDeleteClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    deleteFile();
  };

  const fileControls = () => {
    return (
      <React.Fragment>
        {fileInfo && (
          <a className="sha-upload-history-control">
            {false && <InfoCircleOutlined />}
            <FileVersionsPopup fileId={fileInfo.id} />
          </a>
        )}
        {allowReplace && (
          <a className="sha-upload-replace-control" onClick={onReplaceClick}>
            <SyncOutlined title="Replace" />
          </a>
        )}
        {allowDelete && (
          <a className="sha-upload-remove-control" onClick={onDeleteClick}>
            <DeleteOutlined title="Remove" />
          </a>
        )}
      </React.Fragment>
    );
  };

  const fileProps: UploadProps = {
    name: 'file',
    accept,
    multiple: false,
    fileList: fileInfo ? [fileInfo] : [],
    customRequest: onCustomRequest,
    onChange(info) {
      if (info.file.status !== 'uploading') {
        //
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    itemRender: (_originNode, file, _currFileList) => {
      return (
        <div className={file.error ? 'sha-upload-list-item-error' : ''}>
          <div className="sha-upload-list-item-info">
            {isUploading && <LoadingOutlined className="sha-upload-uploading" />}
            <a target="_blank" title={file.name} onClick={onDownloadClick}>
              {file.name} ({filesize(file.size)})
            </a>

            {!isUploading && fileControls()}
          </div>
        </div>
      );
    },
  };

  const showUploadButton = allowUpload && !fileInfo && !isUploading;
  const classes = fileInfo || isUploading ? 'sha-upload sha-upload-has-file' : 'sha-upload';
  
  const uploadButton = (
    <Button icon={<UploadOutlined />} type="link" ref={uploadButtonRef} style={{ display: !showUploadButton ? 'none' : '' }} >
      (press to upload)
    </Button>
  );
  return isStub
    ? (
      <div className={classes}>
        {uploadButton}
      </div>
    )
    : (
      <Upload {...fileProps} className={classes}>
        {uploadButton}
      </Upload>
    );
};

export default FileUpload;
