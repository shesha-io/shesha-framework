import { ITextAreaSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { Input } from 'antd';

export const TextAreaWrapper: FC<ITextAreaSettingsInputProps> = (props) => {
  const { placeholder, value, onChange, readOnly, size } = props;
  return (
    <Input.TextArea
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      rows={2}
      placeholder={placeholder}
      size={size}
      style={{ top: '4px' }}
    />
  );
};
