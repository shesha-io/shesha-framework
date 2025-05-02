import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  PictureOutlined,
  SyncOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { App, Button, Space, Upload } from 'antd';
import { Image } from 'antd/lib';
import { UploadProps } from 'antd/lib/upload/Upload';
import filesize from 'filesize';
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import React, { FC, useEffect, useRef, useState } from 'react';
import { listType } from '@/designer-components/attachmentsEditor/attachmentsEditor';
import { getFileIcon, isImageType } from '@/icons/fileIcons';
import { useSheshaApplication, useStoredFile, useTheme } from '@/providers';
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
  isStub?: boolean;
  allowedFileTypes?: string[];
  isDragger?: boolean;
  listType?: listType;
  thumbnailWidth?: string;
  thumbnailHeight?: string;
  borderRadius?: number;
  hideFileName?: boolean;
  styles?: any;
  primaryColor?: string;
}

export const FileUpload: FC<IFileUploadProps> = ({
  allowUpload = true,
  allowReplace = true,
  allowDelete = true,
  callback,
  isStub = false,
  allowedFileTypes = [],
  isDragger = false,
  listType = 'text',
  hideFileName = false,
  styles: stylesProp,
  primaryColor,
}) => {
  const {
    fileInfo,
    downloadFile,
    deleteFile,
    uploadFile,
    isInProgress: { uploadFile: isUploading },
  } = useStoredFile();
  const { backendUrl, httpHeaders } = useSheshaApplication();
  const props = {
    style: stylesProp,
    primaryColor,
    model: {
      layout: listType === 'thumbnail' && !isDragger,
      isDragger,
      hideFileName,
      listType,
    },
  };
  const { styles } = useStyles(props);
  const { theme } = useTheme();
  const uploadDraggerSpanRef = useRef(null);
  const hiddenUploadInputRef = useRef<HTMLInputElement>(null);
  const { message } = App.useApp();
  const [imageUrl, setImageUrl] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState({ url: '', uid: '', name: '' });

  const url = fileInfo?.url ? `${backendUrl}${fileInfo.url}` : '';
  useEffect(() => {
    if (fileInfo && url) {
      fetch(url, { headers: { ...httpHeaders, 'Content-Type': 'application/octet-stream' } })
        .then((response) => response.blob())
        .then((blob) => URL.createObjectURL(blob))
        .then((url) => setImageUrl(url));
    }
  }, [fileInfo]);

  const onCustomRequest = ({ file }: RcCustomRequestOptions) => {
    uploadFile({ file: file as File }, callback);
  };

  const onReplaceClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragger) {
      if (hiddenUploadInputRef.current) {
        hiddenUploadInputRef.current.click();
      }
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

  const onPreview = () => {
    if (fileInfo) {
      if (!url) {
        message.error('Preview URL not available');
        return;
      }
      setPreviewImage({ url, uid: fileInfo?.id, name: fileInfo?.name });
      setPreviewOpen(true);
    }
  };

  const fileControls = (color: string) => (
    <Space>
      <a style={{ color: color }}>
        <FileVersionsPopup fileId={fileInfo?.id} />
      </a>
      {allowReplace && (
        <a onClick={onReplaceClick} style={{ color: color }}>
          <SyncOutlined title="Replace" />
        </a>
      )}
      {allowDelete && (
        <a onClick={(e) => onDeleteClick(e)} style={{ color: color }}>
          <DeleteOutlined title="Remove" />
        </a>
      )}
      {listType === 'thumbnail' &&
        (isImageType(fileInfo?.type) ? (
          <a onClick={onPreview} style={{ color: color }}>
            <EyeOutlined title="Preview" />
          </a>
        ) : (
          hideFileName && (
            <a
              onClick={() => downloadFile({ fileId: fileInfo?.id, fileName: fileInfo?.name })}
              style={{ color: color }}
            >
              <DownloadOutlined title="Download" />
            </a>
          )
        ))}
    </Space>
  );

  const iconRender = (fileInfo) => {
    const { type, name } = fileInfo;
    if (isImageType(type)) {
      if (listType === 'thumbnail' && !isDragger) {
        return <Image src={imageUrl} alt={name} preview={false} className={styles.thumbnailControls} />;
      }
    }
    return getFileIcon(type);
  };

  const styledfileControls = () =>
    fileInfo && (
      <div className={styles.styledFileControls}>
        {iconRender(fileInfo)}
        <div className={styles.overlayThumbnailControls} style={{ fontSize: '15px' }}>
          {fileControls('#fff')}
        </div>
      </div>
    );

  const renderFileItem = (file: any) => {
    const showThumbnailControls = !isUploading && listType === 'thumbnail';
    const showTextControls = listType === 'text';

    return (
      <div>
        {showThumbnailControls && styledfileControls()}
        <a title={file.name}>
          <Space>
            {isUploading ? (
              <SyncOutlined spin />
            ) : (
              <div className="thumbnail-item-name">
                {(listType === 'text' || !hideFileName) && (
                  <a
                    style={{ marginRight: '5px' }}
                    onClick={
                      isImageType(file.type) ? onPreview : () => downloadFile({ fileId: file.id, fileName: file.name })
                    }
                  >
                    {listType !== 'thumbnail' && getFileIcon(file?.type)} {`${file.name} (${filesize(file.size)})`}
                  </a>
                )}
                {showTextControls && fileControls(theme.application.primaryColor)}
              </div>
            )}
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
    style: !isDragger && stylesProp,
    customRequest: onCustomRequest,
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} upload failed`);
      }
    },
    itemRender: (_originNode, file) => renderFileItem(file),
  };

  const showUploadButton = allowUpload && !isUploading;

  const uploadButton = (
    <Button
      icon={!fileInfo ? <UploadOutlined /> : <PictureOutlined />}
      type="link"
      style={{ display: !showUploadButton ? 'none' : '' }}
    >
      {listType === 'text' ? `(press to upload)` : null}
    </Button>
  );

  const renderStub = () => {
    if (isDragger) {
      return (
        <Dragger disabled>
          <DraggerStub styles={styles} />
        </Dragger>
      );
    }

    return (
      <>
        <div
          className={
            listType === 'thumbnail' ? 'ant-upload-list-item-name ant-upload-list-item-name-stub thumbnail-stub' : ''
          }
        >
          {uploadButton}
        </div>
        {listType === 'thumbnail' && !hideFileName ? <div className="thumbnail-item-name">File name</div> : null}
      </>
    );
  };

  const renderUploader = () => {
    const antListType = listType === 'thumbnail' ? 'picture-card' : 'text';

    if (isDragger && allowUpload) {
      return (
        <Dragger {...fileProps}>
          <span ref={uploadDraggerSpanRef} />
          <DraggerStub styles={styles} />
        </Dragger>
      );
    }

    return (
      <div>
        <Upload {...fileProps} listType={antListType}>
          {allowUpload && !fileInfo && uploadButton}
        </Upload>
      </div>
    );
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
            toolbarRender: (original) => (
              <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                {
                  <DownloadOutlined
                    className={styles.antPreviewDownloadIcon}
                    onClick={() => downloadFile({ fileId: previewImage?.uid, fileName: previewImage?.name })}
                  />
                }
                {original}
              </div>
            ),
          }}
          src={imageUrl}
        />
      )}

      {/* Hidden file input for replace functionality */}
      <input
        type="file"
        accept={allowedFileTypes?.join(',')}
        style={{ display: 'none' }}
        ref={hiddenUploadInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            uploadFile({ file }, callback);
          }
          e.target.value = ''; // Reset for next time
        }}
      />
    </>
  );
};

export default FileUpload;
