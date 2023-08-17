import React, { FC } from 'react';
import { InboxOutlined } from '@ant-design/icons';
export const DraggerStub: FC = () => {
  return (
    <div className="ant-upload ant-upload-drag">
      <span className="ant-upload ant-upload-btn">
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">
          Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files
        </p>
      </span>
    </div>
  );
};
