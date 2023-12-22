import React, { FC, useEffect, useState } from 'react';
import { useStoredFile } from '@/providers';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import { ValidationErrors } from '@/components';

export type datasourceType = 'url' | 'storedFileId';

export interface IImageProps {
  height: number | string;
  width: number | string;
  url?: string;
  storedFileId?: string;
  dataSource: datasourceType;
  styles: React.CSSProperties;
}

const FileView: FC<IImageProps> = ({ dataSource, url, storedFileId, height, width, styles }) => {
  const { getStoredFile } = useStoredFile();

  const [src, setUrl] = useState<string>();

  const isStoredFileId = dataSource !== 'url' && storedFileId;
  const isRawUrl = dataSource === 'url' && url;



  useEffect(() => {
    if (isStoredFileId && isValidGuid(storedFileId)) {
      getStoredFile({ id: storedFileId }).then((file: string) => {
        setUrl(() => file);
      });
    } else if(isRawUrl) {
      setUrl(() => url);
    }
  }, [dataSource]);


  if (isStoredFileId && !isValidGuid(storedFileId)) {
    return <ValidationErrors error="The provided StoredFileId is inValid" />;
  }

  return (
    <div className="container">
      <img
        src={isStoredFileId ? `data:image/png;base64, ${src}` : src}
        alt="Avatar"
        width={width}
        height={height}
        style={styles}
      />
    </div>
  );
};

export default FileView;
