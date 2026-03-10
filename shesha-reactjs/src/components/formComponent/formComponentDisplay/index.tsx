import React, { FC } from 'react';
import { EditOutlined, LockOutlined } from '@ant-design/icons';

interface IFormComponentDisplayProps {
  value?: any;
  className?: string;
  editable?: boolean;
  onEdit?: (args: any) => any;
}

export const FormComponentDisplay: FC<IFormComponentDisplayProps> = ({ className, value, onEdit, editable }) => {
  const renderIcon = (): JSX.Element => (editable ? <EditOutlined onClick={onEdit} /> : <LockOutlined />);

  return (
    <span className={`sha-form-component sha-form-component-display ${className}`}>
      {value} {renderIcon()}
    </span>
  );
};

export default FormComponentDisplay;
