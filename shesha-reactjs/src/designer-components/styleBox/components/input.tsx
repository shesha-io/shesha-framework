import { Input } from 'antd';
import React, { FC } from 'react';
import { IInputDirection, IValue } from '../interfaces';
import { getStyleChangeValue, getStyleValue } from './utils';
import { getStyleClassName } from '../styles/styles';
import { useShaFormInstance } from '@/providers';

interface IProps {
  direction: keyof IInputDirection;
  onChange?: Function;
  readOnly?: boolean;
  type: keyof IValue;
  value?: string;
}

const BoxInput: FC<IProps> = ({ direction, onChange, readOnly, type, value }) => {
  const shaForm = useShaFormInstance();
  const settings = shaForm.settings;
  const defaultMargins = settings?.formItemMargin || {};

  const onModifyChange: React.ChangeEventHandler<HTMLInputElement> = ({ target: { value: currentValue } }) => {
    if (currentValue.length < 4) {
      onChange(getStyleChangeValue(type, direction, currentValue, value));
    }
  };

  return (
    <Input
      className={getStyleClassName(type, direction)}
      onChange={onModifyChange}
      value={getStyleValue(type, direction, value) ?? defaultMargins[direction]}
      type="number"
      disabled={readOnly}
      placeholder="auto"
    />
  );
};

export default BoxInput;
