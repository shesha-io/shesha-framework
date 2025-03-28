import { listType } from '@/designer-components/attachmentsEditor/attachmentsEditor';
import { useStoredFile } from '@/providers';
import {
  DeleteOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  SyncOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { App, Button, Upload } from 'antd';
import { UploadProps } from 'antd/lib/upload/Upload';
import classNames from 'classnames';
import filesize from 'filesize';
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import React, { FC, useRef } from 'react';
import { FileVersionsPopup } from './fileVersionsPopup';
import { DraggerStub } from './stubs';
import { useStyles } from './styles/styles';

const { Dragger } = Upload;

export interface IFileUploadProps {
  allowUpload?: boolean;
  allowReplace?: boolean;
  allowDelete?: boolean;
  callback?: (...args: any) => any;
  value?: any;
  onChange?: any;
  /* isStub is used just to fix strange error when the user is reordering components on the form */
  isStub?: boolean;
  allowedFileTypes?: string[];
  isDragger?: boolean;
  listType?: listType;
  thumbnailWidth?: string;
  thumbnailHeight?: string;
  borderRadius?: number;
  hideFileName?: boolean;
  readonly?: boolean;

}

export const FileUpload: FC<IFileUploadProps> = ({
  allowUpload = true,
  allowReplace = true,
  allowDelete = true,
  //uploadMode = 'async',
  callback,
  isStub = false,
  allowedFileTypes = [],
  isDragger = false,
  listType = 'text',
  readonly,
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
  const { styles } = useStyles();
  const uploadButtonRef = useRef(null);
  const uploadDraggerSpanRef = useRef(null);
  const { message } = App.useApp();

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

    if (!isDragger) {
      uploadButtonRef.current.click();
    } else {
      if (uploadDraggerSpanRef.current) {
        uploadDraggerSpanRef.current.click();
      }
    }
  };

  const onDeleteClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    deleteFile();
  };

  const fileControls = () => {
    return (
      <React.Fragment>
        {fileInfo && (
          <a >
            {false && <InfoCircleOutlined />}
            <FileVersionsPopup fileId={fileInfo.id} />
          </a>
        )}
        {allowReplace && (
          <a  onClick={onReplaceClick}>
            <SyncOutlined title="Replace" />
          </a>
        )}
        {allowDelete && (
          <a onClick={onDeleteClick}>
            <DeleteOutlined title="Remove" />
          </a>
        )}
      </React.Fragment>
    );
  };

  const fileProps: UploadProps = {
    name: 'file',
    disabled: readonly && allowUpload,
    accept: allowedFileTypes?.join(','),
    multiple: false,
    listType: listType === 'text' ? 'text' : 'picture-card',
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
        <div >
          <div >
            {isUploading && <LoadingOutlined />}
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
  // const classes = classNames(styles.shaUpload, { [styles.shaUploadHasFile]: fileInfo || isUploading });

  const uploadButton = (
    <Button
      icon={<UploadOutlined />}
      type="link"
      ref={uploadButtonRef}
      style={{ display: !showUploadButton ? 'none' : '' }}
    >
      {listType ==='text' ?`(press to upload)`: null}
    </Button>
  );

  const renderStub = () => {
    if (isDragger) {
      return <Dragger disabled><DraggerStub /></Dragger>;
    }

    return <div>{uploadButton}</div>;
  };

  const renderUploader = () => {
    if (isDragger && allowUpload) {
      return (
        <Dragger {...fileProps} >
          <span ref={uploadDraggerSpanRef} />
          <DraggerStub />
        </Dragger>
      );
    }
    return (
      <Upload {...fileProps}  >
        {allowUpload && uploadButton}
      </Upload>
    );
  };


  return <span className={styles.shaStoredFilesRenderer}>{isStub ? renderStub() : renderUploader()}</span>;
};

export default FileUpload;
