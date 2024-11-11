import React, { FC, useRef } from 'react';
import { useStoredFile } from '@/providers';
import { Upload, App, Button } from 'antd';
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import {
  InfoCircleOutlined,
  SyncOutlined,
  DeleteOutlined,
  LoadingOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { UploadProps } from 'antd/lib/upload/Upload';
import filesize from 'filesize';
import { FileVersionsPopup } from './fileVersionsPopup';
import { DraggerStub } from './stubs';
import { useStyles } from './styles/styles';
import classNames from 'classnames';

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
          <a className={styles.shaUploadHistoryControl}>
            {false && <InfoCircleOutlined />}
            <FileVersionsPopup fileId={fileInfo.id} />
          </a>
        )}
        {allowReplace && (
          <a className={styles.shaUploadReplaceControl} onClick={onReplaceClick}>
            <SyncOutlined title="Replace" />
          </a>
        )}
        {allowDelete && (
          <a className={styles.shaUploadRemoveControl} onClick={onDeleteClick}>
            <DeleteOutlined title="Remove" />
          </a>
        )}
      </React.Fragment>
    );
  };

  const fileProps: UploadProps = {
    name: 'file',
    disabled: !allowUpload,
    accept: allowedFileTypes?.join(','),
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
        <div className={file.error ? styles.shaUploadListItemError : ''}>
          <div className={styles.shaUploadListItemInfo}>
            {isUploading && <LoadingOutlined className={styles.shaUploadUploading} />}
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
  const classes = classNames(styles.shaUpload, { [styles.shaUploadHasFile]: fileInfo || isUploading });

  const uploadButton = (
    <Button
      icon={<UploadOutlined />}
      type="link"
      ref={uploadButtonRef}
      style={{ display: !showUploadButton ? 'none' : '' }}
    >
      (press to upload)
    </Button>
  );

  const renderStub = () => {
    if (isDragger) {
      return  <Dragger disabled><DraggerStub /></Dragger>;
    }

    return <div className={classes}>{uploadButton}</div>;
  };

  const renderUploader = () => {
    if (isDragger && allowUpload) {
      return (
        <Dragger {...fileProps} className={classes}>
          <span ref={uploadDraggerSpanRef} />
            <DraggerStub/>
        </Dragger>
      );
    }

    return (
        <Upload {...fileProps} className={classes}>
          {allowUpload && uploadButton}
        </Upload>
      );
  };


  return <span className={styles.shaFileUploadContainer}>{isStub ? renderStub() : renderUploader()}</span>;
};

export default FileUpload;
