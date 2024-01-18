import { DeleteOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import React, { FC } from 'react';
import { ICustomInputProps } from '../model';
import { useStyles } from '../styles/styles';


const CustomInput: FC<ICustomInputProps> = ({ onChange, value: val, onDelete, defaultNumber }) => {
  const { styles } = useStyles();
  return (
    <div className={styles.customInputContainer}>
      <Input
        defaultValue={!val ? `${defaultNumber}.` : val}
        autoFocus
        onChange={({ target: { value } }) => {
          onChange(value);
        }}
      />
      <Button>
        <DeleteOutlined onClick={() => onDelete()} />
      </Button>
    </div>
  );
};

export default CustomInput;
