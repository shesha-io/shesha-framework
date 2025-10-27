import { Input, Tooltip } from 'antd';
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

  const currentValue = getStyleValue(type, direction, value) ?? defaultMargins[direction];
  const isEmpty = !currentValue || currentValue === '0';

  return (
    <Tooltip
      title={isEmpty ? "Leave empty or '0' for auto" : undefined}
      placement="top"
    >
      <Input
        className={getStyleClassName(type, direction)}
        onChange={onModifyChange}
        value={currentValue}
        disabled={readOnly}
        style={isEmpty ? { color: '#bfbfbf', fontStyle: 'italic' } : undefined}
      />
    </Tooltip>
  );
};

export default BoxInput;
