import { IMultiColorPickerSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { MultiColorInput } from '@/designer-components/multiColorInput';

export const MultiColorPickerWrapper: FCUnwrapped<IMultiColorPickerSettingsInputProps> = (props) => {
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
