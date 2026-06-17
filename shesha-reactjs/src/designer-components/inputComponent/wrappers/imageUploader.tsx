import { IImageUploaderSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { ImagePicker } from '../../imagePicker';

export const ImageUploaderWrapper: FCUnwrapped<IImageUploaderSettingsInputProps> = (props) => {
  const { value, onChange, readOnly = false } = props;
  return (
    <ImagePicker
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
  );
};
