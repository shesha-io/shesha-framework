import React, { FC } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { useStyles } from './styles/styles';

export const DraggerStub: FC = () => {
  const { styles } = useStyles();

  return (
    <div>
        <p className={styles.antUploadDragIcon}>
          <InboxOutlined className={`${styles.antUploadDragIcon} icon`}/>
        </p>
        <p className={styles.antUploadText}>Click or drag file to this area to upload</p>
        <p className={styles.antUploadHint}>
          Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files
        </p>
    </div>
  );
};
