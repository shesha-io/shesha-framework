import { IColorPickerSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { ColorPicker } from '@/components';

export const ColorPickerWrapper: FC<IColorPickerSettingsInputProps> = ({ value, onChange, readOnly, size, showText }) => {
  return (
    <ColorPicker
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      size={size}
      allowClear
      showText={showText}
    />
  );
};
