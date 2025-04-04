import { listType } from '@/designer-components/attachmentsEditor/attachmentsEditor';
import { getFileIcon, isImageType } from '@/icons/fileIcons';
import { useSheshaApplication, useStoredFile, useTheme } from '@/providers';
import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  SyncOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { App, Button, Space, Upload } from 'antd';
import { Image } from 'antd/lib';
import { UploadProps } from 'antd/lib/upload/Upload';
import filesize from 'filesize';
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import React, { FC, useEffect, useRef, useState } from 'react';
import FileVersionsPopup from './fileVersionsPopup';
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


  const props = {
    style: stylesProp,
    model: {
      layout: listType === 'thumbnail' && !isDragger,
      hideFileName: hideFileName && listType === 'thumbnail',
      isDragger,
    },
  };
  const { styles } = useStyles(props);
  const { theme } = useTheme();
  const uploadButtonRef = useRef(null);
  const uploadDraggerSpanRef = useRef(null);
  const { message } = App.useApp();
  const [imageUrl, setImageUrl] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState({ url: '', uid: '', name: '' });

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

  const onCustomRequest = ({ file /*, onError, onSuccess*/ }: RcCustomRequestOptions) => {
    // call action from context
    uploadFile({ file: file as File }, callback);
  };

  const onReplaceClick = (e) => {
    e.preventDefault();

    if (!isDragger) {
      uploadButtonRef?.current?.click();
    } else {
      if (uploadDraggerSpanRef.current) {
        uploadDraggerSpanRef?.current?.click();
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

  const fileControls = (color: string) => {
    return (
      //space between the icons
      <Space>
        <a style={{ color: color }}>
          {false && <InfoCircleOutlined />}
          <FileVersionsPopup fileId={fileInfo.id} />
        </a>
        {allowReplace && (
          <a onClick={(e) => onReplaceClick(e)} style={{ color: color }}>
            <SyncOutlined title="Replace" />
          </a>
        )}
        {allowDelete && (
          <a onClick={(e) => onDeleteClick(e)} style={{ color: color }}>
            <DeleteOutlined title="Remove" />
          </a>
        )}
        {
          <a onClick={onPreview} style={{ color: color }}>
            <EyeOutlined title="Preview" />
          </a>
        }
      </Space>
    );
  };

  const iconRender = (fileInfo) => {
    const { type, name } = fileInfo;
    if (isImageType(type)) {
      if (listType === 'thumbnail' && !isDragger) {
        return <Image src={imageUrl} alt={name} preview={false} className={styles.thumbnailControls} />;
      }
    }

    return getFileIcon(type);
  };

  const styledfileControls = () => {
    return (
      fileInfo && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {iconRender(fileInfo)}
          <div className={styles.overlayThumbnailControls}>{fileControls('#fff')}</div>
        </div>
      )
    );
  };

  const renderFileItem = (file: any) => {
    const showThumbnailControls = !isUploading && listType === 'thumbnail';
    const showTextControls = listType === 'text';

    return (
      <div>
        {showThumbnailControls && styledfileControls()}
        <a title={file.name} style={{ display: 'block', marginTop: '5px' }}>
          <Space>
            {file.name} ({filesize(file.size)}){showTextControls && fileControls(theme.application.primaryColor)}
          </Space>
        </a>
      </div>
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
    itemRender: (_originNode, file) => renderFileItem(file),
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
          <DraggerStub styles={styles}/>
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
          <DraggerStub styles={styles} />
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
