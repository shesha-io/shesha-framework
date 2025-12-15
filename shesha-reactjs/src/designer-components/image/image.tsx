import React, { FC, useEffect, useMemo, useState } from 'react';
import { App, Button, Image, Tooltip, Upload, UploadProps } from 'antd';
import { toBase64, useSheshaApplication, useStoredFile } from '@/index';
import { isFileTypeAllowed } from '@/utils/fileValidation';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';

export type ImageSourceType = 'url' | 'storedFile' | 'base64';

export interface IImageFieldProps {
  value?: string;
  onChange?: (newValue: string) => void;
  readOnly: boolean;
  imageSource: ImageSourceType;
  styles: React.CSSProperties;
  allowPreview?: boolean;
  allowedFileTypes?: string[];
  alt?: string;
}

export const ImageField: FC<IImageFieldProps> = (props) => {
  const { imageSource, value, allowPreview = false, styles, onChange, allowedFileTypes } = props;

  const readOnly = props?.readOnly || props.imageSource === 'url';

  const { uploadFile, deleteFile, fileInfo } = useStoredFile(false) ?? {};
  const { backendUrl, httpHeaders } = useSheshaApplication();
  const { message } = App.useApp();

  const [fileUrl, setFileUrl] = useState<string>();
  const [revokeUrl, setRevokeUrl] = useState<(() => void) | null>(null);

  const isStoredFile = imageSource === 'storedFile';
  const isRawUrl = imageSource === 'url' && Boolean(value);
  const isBase64 = imageSource === 'base64' && Boolean(value);

  const fetchStoredFile = (url: string): void => {
    let objectUrl: string | null = null;

    fetch(`${backendUrl}${url}`,
      { headers: { ...httpHeaders, "Content-Type": "application/octet-stream" } })
      .then((response) => {
        return response.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);

        // Revoke the previous URL before setting a new one
        if (revokeUrl) {
          revokeUrl();
        }

        setFileUrl(objectUrl);
        // Store revoke function for cleanup
        setRevokeUrl(() => () => URL.revokeObjectURL(objectUrl));
      })
      .catch((error) => {
        console.error('Failed to fetch stored file:', error);
        // Clean up object URL if it was created before error occurred
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      });
  };

  useEffect(() => {
    if (isStoredFile) {
      if (fileInfo?.url) {
        fetchStoredFile(fileInfo?.url);
      } else if (!fileInfo) {
        // Clean up the object URL when file is removed
        if (revokeUrl) {
          revokeUrl();
          setRevokeUrl(null);
        }
        setFileUrl(null);
      }
    }
  }, [isStoredFile, fileInfo]);

  // Cleanup effect: revoke object URL when component unmounts
  useEffect(() => {
    return () => {
      if (revokeUrl) {
        revokeUrl();
      }
    };
  }, [revokeUrl]);

  const content = useMemo(() => {
    return isRawUrl
      ? value
      : isBase64
        ? value
        : isStoredFile && Boolean(fileUrl)
          ? fileUrl
          : null;
  }, [imageSource, value, fileUrl]);

  const onRemove = (): void => {
    if (imageSource === 'base64') {
      if (onChange)
        onChange(null);
    } else if (imageSource === 'storedFile') {
      deleteFile();
    }
  };

  const uploadProps: UploadProps = {
    accept: props.allowedFileTypes?.join(','),
    showUploadList: false,
    beforeUpload: async (file) => {
      if (!isFileTypeAllowed(file.name, allowedFileTypes)) {
        message.error(`File type not allowed. Only ${allowedFileTypes.join(', ')} files are accepted.`);
        return Upload.LIST_IGNORE;
      }

      if (imageSource === 'base64') {
        if (onChange)
          onChange(await toBase64(file));
      } else if (imageSource === 'storedFile') {
        uploadFile({ file: file }, () => {
          // if (value)
          // fetchStoredFile();
        });
      }
      return false;
    },
    fileList: [],
  };

  return (
    <div style={{ position: 'relative', float: 'left' }}>
      {content && (
        <Image
          src={content}
          alt={props?.alt}
          width={styles.width}
          height={styles.height}
          preview={allowPreview}
          style={styles}
        />
      )}
      {!readOnly && (
        <>
          <div style={content ? { position: 'absolute', top: 'calc(50% - 50px)', left: 'calc(50% - 40px)' } : {}}>
            <Upload
              {...uploadProps}
            >
              {content && <Tooltip title="Upload"><Button shape="circle" ghost icon={<UploadOutlined />} /></Tooltip>}
              {!content && <Button icon={<UploadOutlined />} type="link">(press to upload)</Button>}
            </Upload>
          </div>
          <div style={{ position: 'absolute', top: 'calc(50% - 50px)', left: 'calc(50% + 10px)' }}>
            {content && <Tooltip title="Remove"><Button shape="circle" ghost icon={<DeleteOutlined />} onClick={onRemove} /></Tooltip>}
          </div>
        </>
      )}
    </div>
  );
};
