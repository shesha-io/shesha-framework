import { Spin } from 'antd';
import React, { FC } from 'react';

export interface ICodeEditorLoadingProgressorProps {
  message?: string;
}

export const CodeEditorLoadingProgressor: FC<ICodeEditorLoadingProgressorProps> = ({ message }) => {
  return (
    <Spin tip={message || "Load editor..."}>
      <div style={{ width: "100%", height: "100%", minHeight: "200px", minWidth: "200px" }} />
    </Spin>
  );
};
