import { ITextAreaSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { Input } from 'antd';

export const TextAreaWrapper: FC<ITextAreaSettingsInputProps> = (props) => {
  const { metadataValue, placeholder, value, onChange, readOnly, size } = props;

  const [focused, setFocused] = React.useState(false);
  const localValue = !focused && !value ? metadataValue : value;

  return (
    <Input.TextArea
      value={localValue}
      onChange={onChange}
      readOnly={readOnly}
      rows={2}
      placeholder={placeholder ?? metadataValue?.toString()}
      size={size}
      style={{ top: '4px' }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
};
