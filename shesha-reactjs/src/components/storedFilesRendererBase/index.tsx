import Dragger, { DraggerProps } from 'antd/lib/upload/Dragger';
import React, { FC, useEffect } from 'react';
import {
  Alert,
  Button,
  ButtonProps,
  App,
  Upload
  } from 'antd';
import { DraggerStub } from '@/components/fileUpload/stubs';
import { FileZipOutlined, UploadOutlined } from '@ant-design/icons';
import { IDownloadFilePayload, IStoredFile, IUploadFilePayload } from '@/providers/storedFiles/contexts';
import { RcFile, UploadChangeParam } from 'antd/lib/upload/interface';
import { useStyles } from './styles/styles';

interface IUploaderFileTypes {
  name: string;
  type: string;
}

export interface IStoredFilesRendererBaseProps {
  fileList?: IStoredFile[];
  allowUpload?: boolean;
  allowDelete?: boolean;
  showDragger?: boolean;
  ownerId?: string;
  ownerType?: string;
  multiple?: boolean;
  isDownloadingFileListZip?: boolean;
  isDownloadZipSucceeded?: boolean;
  fetchFilesError?: boolean;
  downloadZipFileError?: boolean;
  deleteFile: (fileIdToDelete: string) => void;
  uploadFile: (payload: IUploadFilePayload) => void;
  downloadZipFile?: () => void;
  downloadZip?: boolean;
  downloadFile: (payload: IDownloadFilePayload) => void;
  validFileTypes?: IUploaderFileTypes[];
  maxFileLength?: number;
  isDragger?: boolean;
  disabled?: boolean;
  uploadBtnProps?: ButtonProps;
  /* isStub is used just to fix strange error when the user is reordering components on the form */
  isStub?: boolean;
  allowedFileTypes?: string[];
  maxHeight?: string;
}

export const StoredFilesRendererBase: FC<IStoredFilesRendererBaseProps> = ({
  multiple = true,
  fileList = [],
  isDownloadingFileListZip,
  isDownloadZipSucceeded,
  deleteFile,
  uploadFile,
  downloadZipFile,
  downloadFile,
  ownerId,
  ownerType,
  fetchFilesError,
  downloadZipFileError,
  uploadBtnProps,
  validFileTypes = [],
  maxFileLength = 0,
  isDragger = false,
  disabled,
  isStub = false,
  allowedFileTypes = [],
  maxHeight,
  downloadZip,
  allowDelete
}) => {
  const hasFiles = !!fileList.length;
  const { styles } = useStyles();
  const { message, notification } = App.useApp();

  const openFilesZipNotification = () =>
    notification.success({
      message: `Download success!`,
      description: 'Your files have been downloaded successfully. Please check your download folder.',
      placement: 'topRight',
    });

  useEffect(() => {
    if (isDownloadZipSucceeded) {
      openFilesZipNotification();
    }
  }, [isDownloadZipSucceeded]);

  const props: DraggerProps = {
    name: 'file',
    accept: allowedFileTypes?.join(','),
    multiple,
    fileList,
    disabled,
    onChange(info: UploadChangeParam) {
      const { status } = info.file;

      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onRemove(file) {
      deleteFile(file.uid);
    },
    customRequest(options: any) {
      // It used to be RcCustomRequestOptions, but it doesn't seem to be found anymore
      uploadFile({ file: options.file, ownerId, ownerType });
    },
    beforeUpload(file: RcFile) {
      const { type, size } = file;

      const isValidFileType =
        validFileTypes.length === 0 ? true : validFileTypes.map(({ type: fileType }) => fileType).includes(type);

      if (!isValidFileType) {
        const validTypes = validFileTypes.map(({ name }) => name).join(',');

        message.error(`You can only upload files of type: (${validTypes})`);
      }

      const isAcceptableFileSize = maxFileLength === 0 ? true : size / 1024 / 1024 <= maxFileLength;

      if (!isAcceptableFileSize) {
        message.error(`Image must smaller than ${maxFileLength}MB!`);
      }

      return isValidFileType && isAcceptableFileSize;
    },
    onDownload: ({ uid, name }) => {
      downloadFile({ fileId: uid, fileName: name });
    },
    onPreview: ({ uid, name }) => {
      downloadFile({ fileId: uid, fileName: name });
    },
    showUploadList: {
      showRemoveIcon: allowDelete,
    }
  };

  const renderUploadContent = () => {
    return (
      <Button type="link" icon={<UploadOutlined />} style={{ display: disabled ? 'none' : '' }} {...uploadBtnProps}>
        (press to upload)
      </Button>
    );
  };

  return (
    <div className={styles.shaStoredFilesRenderer} style={{ maxHeight }}>
      {isStub 
        ? isDragger
          ? <Dragger disabled><DraggerStub /></Dragger>
          : <div>{renderUploadContent()}</div>
        : props.disabled
          ? <Upload {...props} />
          : isDragger
            ? <Dragger {...props}><DraggerStub /></Dragger>
            : <Upload {...props}>{!props.disabled ? renderUploadContent() : null}</Upload>
      }

      {fetchFilesError && (
        <Alert message="Error" description="Sorry, an error occurred while trying to fetch file list." type="error" />
      )}

      {downloadZipFileError && (
        <Alert message="Error" description="Sorry, an error occurred while trying to download zip file." type="error" />
      )}

      {downloadZip && hasFiles && !!downloadZipFile && (
        <div className={styles.storedFilesRendererBtnContainer}>
          <Button size="small" type="link" icon onClick={() => downloadZipFile()} loading={isDownloadingFileListZip}>
            {!isDownloadingFileListZip && <FileZipOutlined />} Download Zip
          </Button>
        </div>
      )}
    </div>
  );
};

export default StoredFilesRendererBase;
