import React, { FC } from 'react';
import { CloseOutlined } from '@ant-design/icons';

export interface ICancelButtonProps {
  onCancel: (args: any) => void;
}

export const CancelButton: FC<ICancelButtonProps> = ({ onCancel }) => (
  <div className="sha-cancel-btn" onClick={onCancel}>
    <CloseOutlined />
  </div>
);

export default CancelButton;
