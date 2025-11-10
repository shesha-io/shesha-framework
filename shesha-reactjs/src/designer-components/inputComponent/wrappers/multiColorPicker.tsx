import { IMultiColorPickerSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { MultiColorInput } from '@/designer-components/multiColorInput';

export const MultiColorPickerWrapper: FC<IMultiColorPickerSettingsInputProps> = (props) => {
  const { value, onChange, readOnly, propertyName } = props;
  return (
    <MultiColorInput
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      propertyName={propertyName}
    />
  );
};
