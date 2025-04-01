import { listType } from '@/designer-components/attachmentsEditor/attachmentsEditor';
import { useSheshaApplication, useStoredFile } from '@/providers';
import {
  DeleteOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  SyncOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { App, Button, Upload } from 'antd';
import { UploadProps } from 'antd/lib/upload/Upload';
import filesize from 'filesize';
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import React, { FC, useEffect, useRef, useState } from 'react';
import { FileVersionsPopup } from './fileVersionsPopup';
import { DraggerStub } from './stubs';
import { useStyles } from './styles/styles';
import { isImageType, getFileIcon } from '@/icons/fileIcons';
import { Image } from 'antd/lib';
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
  styles?: any;
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
  hideFileName = false,
  readonly,
  styles: stylesProp,
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
  const { backendUrl, httpHeaders } = useSheshaApplication();

  const { styles } = useStyles({ styles: stylesProp, model: { layout: listType === 'thumbnail' && !isDragger, hideFileName: hideFileName && listType === 'thumbnail', isDragger } });
  const uploadButtonRef = useRef(null);
  const uploadDraggerSpanRef = useRef(null);
  const { message } = App.useApp();
  const [imageUrl, setImageUrl] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const onCustomRequest = ({ file /*, onError, onSuccess*/ }: RcCustomRequestOptions) => {
    // call action from context
    uploadFile({ file: file as File }, callback);
  };

  const onDownloadClick = (e) => {
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

  const onDeleteClick = (e) => {
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
          <a onClick={onReplaceClick}>
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

  useEffect(() => {
    fetch(`${backendUrl}${fileInfo?.url}`,
      { headers: { ...httpHeaders, "Content-Type": "application/octet-stream" } })
      .then((response) => {
        return response.blob();
      })
      .then((blob) => {
        return URL.createObjectURL(blob);
      })
      .then((url) => {
        setImageUrl(url);
      });

  }, [fileInfo]);

  const iconRender = (fileInfo) => {
    const { type, name } = fileInfo;
    if (isImageType(type)) {
      if (listType === 'thumbnail' && !isDragger) {
        return <Image src={imageUrl} alt={name} preview={false} />;
      }
    }

    return getFileIcon(type);
  };

  const fileProps: UploadProps = {
    name: 'file',
    disabled: readonly && allowUpload,
    accept: allowedFileTypes?.join(','),
    multiple: false,
    listType: listType === 'text' ? 'text' : 'picture-card',
    fileList: fileInfo ? [fileInfo] : [],
    customRequest: onCustomRequest,
    onPreview: () => setPreviewOpen(true),
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
    onRemove: () => deleteFile(),
    onDownload: (e) => onDownloadClick(e),
    showUploadList: {
      showRemoveIcon: allowDelete,
      showDownloadIcon: true,
    },
    iconRender: iconRender,
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
      {listType === 'text' ? `(press to upload)` : null}
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
        {allowUpload && !fileInfo && uploadButton}
      </Upload>
    );
  };


  return <>
    <span className={styles.shaStoredFilesRenderer}>{isStub ? renderStub() : renderUploader()}</span>
    {previewOpen && (
      <Image
        wrapperStyle={{ display: 'none' }}
        preview={{
          visible: previewOpen,
          onVisibleChange: (visible) => setPreviewOpen(visible),
          afterOpenChange: (visible) => !visible,
          toolbarRender: (original) => {
            return <div style={{ display: 'flex', flexDirection: 'row-reverse' }}><DownloadOutlined className={styles.antPreviewDownloadIcon} onClick={() => downloadFile({ fileId: previewImage.uid, fileName: previewImage.name })} />{original}</div>;
          },
        }}
        src={imageUrl}
      />
    )}
  </>;
};

export default FileUpload;
