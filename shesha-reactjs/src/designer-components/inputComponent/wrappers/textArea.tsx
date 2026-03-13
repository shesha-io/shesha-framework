import { ITextAreaSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { Input } from 'antd';

export const TextAreaWrapper: FCUnwrapped<ITextAreaSettingsInputProps> = (props) => {
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
