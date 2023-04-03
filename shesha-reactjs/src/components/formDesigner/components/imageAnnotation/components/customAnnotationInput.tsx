import { DeleteOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import React, { FC } from 'react';
import { ICustomInputProps } from '../model';

const CustomInput: FC<ICustomInputProps> = ({ onChange, value, onDelete, defaultNumber }) => {
  return (
    <div className="customInput_container">
      <Input
        defaultValue={!value ? `${defaultNumber}.` : value}
        autoFocus
        onChange={({ target: { value } }) => onChange(value)}
      />
      <Button>
        <DeleteOutlined onClick={() => onDelete()} />
      </Button>
    </div>
  );
};

export default CustomInput;
