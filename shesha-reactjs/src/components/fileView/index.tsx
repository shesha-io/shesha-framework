import React, { FC, useEffect, useMemo, useState } from 'react';
import { useStoredFile } from '@/providers';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import { Spin } from 'antd';

export type FileDataSourceType = 'url' | 'storedFileId' | 'base64';

export interface IImageProps {
  height?: number | string;
  width?: number | string;
  url?: string;
  storedFileId?: string;
  base64?: string;
  dataSource: FileDataSourceType;
  styles: React.CSSProperties;
}

const FileView: FC<IImageProps> = ({ dataSource, url, storedFileId, base64, height, width, styles }) => {
  const { getStoredFile } = useStoredFile();

  const [storedFile, setStoredFile] = useState<string>();

  const isStoredFileId = dataSource === 'storedFileId' && Boolean(storedFileId);
  const isRawUrl = dataSource === 'url' && Boolean(url);
  const isBase64 = dataSource === 'base64' && Boolean(base64);

  useEffect(() => {
    if (isStoredFileId && isValidGuid(storedFileId)) {
      getStoredFile({ id: storedFileId }).then((file: string) => {
        setStoredFile(() => file);
      });
    }
  }, [isStoredFileId, storedFileId]);

  const content = useMemo(() => {
    return isRawUrl
      ? url
      : isBase64
        ? `data:image/png;base64, ${base64}`
        : isStoredFileId && Boolean(storedFile)
          ? `data:image/png;base64, ${storedFile}`
          : null;
  }, [isRawUrl, url, isBase64, base64, isStoredFileId, storedFile]);

  return (
    <div className="container">
      {content && (
        <img
          src={content}
          alt="image"
          width={width}
          height={height}
          style={styles}
        />
      )}
      {!content && <Spin />}
    </div>
  );
};

export default FileView;
