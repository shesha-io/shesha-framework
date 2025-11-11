import { IEditModeSelectorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import EditModeSelector from '@/components/editModeSelector';

export const EditModeSelectorWrapper: FC<IEditModeSelectorSettingsInputProps> = (props) => {
  const { value, onChange, readOnly, size } = props;
  return (
    <EditModeSelector
      readOnly={readOnly}
      value={value}
      onChange={onChange}
      size={size}
    />
  );
};
