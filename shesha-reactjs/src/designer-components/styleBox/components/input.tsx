import { Input } from 'antd';
import React, { FC } from 'react';
import { IInputDirection, IValue } from '../interfaces';
import { getStyleChangeValue, getStyleValue } from './utils';
import { getStyleClassName } from '../styles/styles';

interface IProps {
  direction: keyof IInputDirection;
  onChange?: Function;
  readOnly?: boolean;
  type: keyof IValue;
  value?: string;
}

const BoxInput: FC<IProps> = ({ direction, onChange, readOnly, type, value }) => {
  const onModifyChange: React.ChangeEventHandler<HTMLInputElement> = ({ target: { value: currentValue } }) => {
    if (currentValue.length < 4) {
      onChange(getStyleChangeValue(type, direction, currentValue, value));
    }
  };

  return (
    <Input
      className={getStyleClassName(type, direction)}
      onChange={onModifyChange}
      value={getStyleValue(type, direction, value)}
      type="text"
      disabled={readOnly}
    />
  );
};

export default BoxInput;
