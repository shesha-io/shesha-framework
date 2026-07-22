import { IColorPickerSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { ColorPicker } from '@/components/colorPicker';
import { ColorValueType } from 'antd/es/color-picker/interface';

export const ColorPickerWrapper: FCUnwrapped<IColorPickerSettingsInputProps> = ({ value, onChange, readOnly, size, showText }) => {
  return (
    <ColorPicker
      value={value as ColorValueType}
      onChange={onChange}
      readOnly={readOnly}
      size={size}
      allowClear
      showText={showText}
    />
  );
};
