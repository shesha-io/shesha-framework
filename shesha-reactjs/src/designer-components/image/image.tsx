import React, { FC, useEffect, useMemo, useState } from 'react';
import { Button, Image, Tooltip, Upload, UploadProps } from 'antd';
import { useStoredFile } from '@/index';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';

export type ImageSourceType = 'url' | 'storedFileId' | 'base64';

export interface IImageFieldProps {
  height?: number | string;
  width?: number | string;
  
  value?: string;
  onChange?: (newValue: string) => void;
  readOnly: boolean;
  imageSource: ImageSourceType;
  styles: React.CSSProperties;

  allowPreview?: boolean;
  allowedFileTypes?: string[];
}

export const ImageField: FC<IImageFieldProps> = (props) => {
  const { height, width, imageSource, value, allowPreview = false, styles, onChange } = props;

  const readOnly = props?.readOnly || props.imageSource === 'url';

  const { getStoredFile, uploadFile, deleteFile } = useStoredFile(false) ?? {};

  const [storedFile, setStoredFile] = useState<string>();

  const isStoredFileId = imageSource === 'storedFileId' && Boolean(value);
  const isRawUrl = imageSource === 'url' && Boolean(value);
  const isBase64 = imageSource === 'base64' && Boolean(value);

  const fetchStoredFile = () => {
    if (isStoredFileId && isValidGuid(value)) {
      getStoredFile({ id: value }).then((file: string) => {
        setStoredFile(() => file);
      });
    }
  };

  useEffect(() => {
      fetchStoredFile();
  }, [isStoredFileId, value]);

  const content = useMemo(() => {
    return isRawUrl 
      ? value 
      : isBase64
        ? value
        : isStoredFileId && Boolean(storedFile)
          ? `data:image/png;base64, ${storedFile}`
          : null;
  }, [imageSource, value, storedFile]);

  const onRemove = () => {
    if (imageSource === 'base64') {
      if (onChange)
        onChange(null);
    } else if (imageSource === 'storedFileId') {
      deleteFile();
    }
};

  const toBase64 = file => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

  const uploadProps: UploadProps = {
    accept: props.allowedFileTypes?.join(','),
    showUploadList: false,
    beforeUpload: async (file) => {
      if (imageSource === 'base64') {
        if (onChange)
          onChange(await toBase64(file));
      } else if (imageSource === 'storedFileId') {
        uploadFile({ file: file }, () => {
          if (value)
            fetchStoredFile();
        });
      }
    },
    fileList: []
  };

  return (
    <div style={{position: 'relative', float: 'left'}}>
      {content &&
        <Image
          src={content}
          alt="image"
          width={Number(width) ? `${width}px` : width}
          height={Number(height) ? `${height}px` : height}
          preview={allowPreview}
          style={styles}
        />
      }
      {!readOnly &&
        <>
          <div style={content ? {position: 'absolute', top: 'calc(50% - 50px)', left: 'calc(50% - 40px)'} : {}}>
            <Upload
              {...uploadProps}
            >
              {content && <Tooltip title='Upload'><Button shape='circle' ghost icon={<UploadOutlined />}/></Tooltip>}
              {!content && <Button icon={<UploadOutlined />} type="link">(press to upload)</Button>}
            </Upload>
          </div>
          <div style={{position: 'absolute', top: 'calc(50% - 50px)', left: 'calc(50% + 10px)'}}>
            {content && <Tooltip title='Remove'><Button shape='circle' ghost icon={<DeleteOutlined />} onClick={onRemove}/></Tooltip>}
          </div>
        </>
      }
    </div>
  );
};