import React from 'react';
import { InboxOutlined } from '@ant-design/icons';

export const DraggerStub = ({ styles }) => {
  return (
    <div>
      <p className={styles.antUploadDragIcon}>
        <InboxOutlined className={`${styles.antUploadDragIcon} icon`} />
      </p>
      <p className={styles.antUploadText}>Click or drag file to this area to upload</p>
      <p className={styles.antUploadHint}>
        Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files
      </p>
    </div>
  );
};
