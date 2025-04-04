import { listType } from '@/designer-components/attachmentsEditor/attachmentsEditor';
import { useSheshaApplication, useStoredFile } from '@/providers';
import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  SyncOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { App, Button, Upload } from 'antd';
import { UploadProps } from 'antd/lib/upload/Upload';
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import React, { FC, useEffect, useRef, useState } from 'react';
import { DraggerStub } from './stubs';
import { useStyles } from './styles/styles';
import { isImageType, getFileIcon } from '@/icons/fileIcons';
import { Image } from 'antd/lib';
import filesize from 'filesize';
import FileVersionsPopup from './fileVersionsPopup';
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

  const { styles } = useStyles({
    styles: stylesProp,
    model: {
      layout: listType === 'thumbnail' && !isDragger,
      hideFileName: hideFileName && listType === 'thumbnail',
      isDragger,
    },
  });
  const uploadButtonRef = useRef(null);
  const uploadDraggerSpanRef = useRef(null);
  const { message } = App.useApp();
  const [imageUrl, setImageUrl] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState({ url: '', uid: '', name: '' });

  const onCustomRequest = ({ file /*, onError, onSuccess*/ }: RcCustomRequestOptions) => {
    // call action from context
    uploadFile({ file: file as File }, callback);
  };

  const onDownloadClick = (e) => {
    e.preventDefault();
    downloadFile({ fileId: fileInfo.id, fileName: fileInfo.name });
  };

  const onReplaceClick = (e) => {
    e.preventDefault();

    if (!isDragger) {
      uploadButtonRef?.current?.click();
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

  const onPreview = () => {
    setPreviewImage({ url, uid: fileInfo.id, name: fileInfo.name });
    setPreviewOpen(true);
  };

  const fileControls = () => {
    return (
      <>
        <a style={{ color: '#000' }}>
          {false && <InfoCircleOutlined />}
          <FileVersionsPopup fileId={fileInfo.id} />
        </a>
        {allowReplace && (
          <a onClick={(e) => onReplaceClick(e)} style={{ color: '#000' }}>
            <SyncOutlined title="Replace" />
          </a>
        )}
        {allowDelete && (
          <a onClick={(e) => onDeleteClick(e)} style={{ color: '#000' }}>
            <DeleteOutlined title="Remove" />
          </a>
        )}
        {
          <a onClick={onPreview} style={{ color: '#000' }}>
            <EyeOutlined title="Preview" />
          </a>
        }
      </>
    );
  };
  const styledfileControls = () => {
    return (
      fileInfo && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Image
            src={imageUrl}
            alt={fileInfo.name}
            preview={false}
            style={{
              width: '90px', // Adjust based on requirement
              height: '90px',
              objectFit: 'cover',
              borderRadius: '8px',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              height: '100%',
              width: '100%',
              padding: '5px',
              borderRadius: '8px',
              display: 'flex',
              gap: '8px',
            }}
          >
            {fileControls()}
          </div>
        </div>
      )
    );
  };

  const url = `${backendUrl}${fileInfo?.url}`;
  useEffect(() => {
    fetch(url, { headers: { ...httpHeaders, 'Content-Type': 'application/octet-stream' } })
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

  // const iconRender = (fileInfo) => {
  //   const { type, name } = fileInfo;
  //   if (isImageType(type)) {
  //     if (listType === 'thumbnail' && !isDragger) {
  //       return <Image src={imageUrl} alt={name} preview={false} />;
  //     }
  //   }

  //   return getFileIcon(type);
  // };

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
        <div>
          {!isUploading && listType === 'thumbnail' ? styledfileControls() : null}
          <a title={file.name} style={{ display: 'block', marginTop: '5px' }}>
            {file.name} ({filesize(file.size)}){listType === 'text' ? fileControls(): null}
          </a>
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
      {listType === 'text' ? `(press to upload)` : null}
    </Button>
  );

  const renderStub = () => {
    if (isDragger) {
      return (
        <Dragger disabled>
          <DraggerStub />
        </Dragger>
      );
    }

    return <div>{uploadButton}</div>;
  };

  const renderUploader = () => {
    if (isDragger && allowUpload) {
      return (
        <Dragger {...fileProps}>
          <span ref={uploadDraggerSpanRef} />
          <DraggerStub />
        </Dragger>
      );
    }
    return <Upload {...fileProps}>{allowUpload && !fileInfo && uploadButton}</Upload>;
  };

  return (
    <>
      <span className={styles.shaStoredFilesRenderer}>{isStub ? renderStub() : renderUploader()}</span>
      {previewOpen && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible,
            toolbarRender: (original) => {
              return (
                <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                  <DownloadOutlined
                    className={styles.antPreviewDownloadIcon}
                    onClick={() => downloadFile({ fileId: previewImage.uid, fileName: previewImage.name })}
                  />
                  {original}
                </div>
              );
            },
          }}
          src={imageUrl}
        />
      )}
    </>
  );
};

export default FileUpload;
