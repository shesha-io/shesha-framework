import React, { FC } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { useStyles } from './styles/styles';

export const DraggerStub: FC = () => {
  const { styles, prefixCls } = useStyles();

  return (
       <span className={`${prefixCls}-upload ${prefixCls}-upload-btn`}>
        <p className={styles.antUploadDragIcon}>
            <InboxOutlined />
          </p>
          <p className={styles.antUploadText}>Click or drag file to this area to upload</p>
          <p className={styles.antUploadHint}>
            Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files
          </p>
      </span>
  );
};

