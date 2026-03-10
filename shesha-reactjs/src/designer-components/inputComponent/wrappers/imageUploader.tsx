import { IImageUploaderSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { ImagePicker } from '../../imagePicker';

export const ImageUploaderWrapper: FC<IImageUploaderSettingsInputProps> = (props) => {
  const { value, onChange, readOnly } = props;
  return (
    <ImagePicker
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
  );
};
