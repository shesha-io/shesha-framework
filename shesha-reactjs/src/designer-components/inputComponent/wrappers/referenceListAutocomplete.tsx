import { IReferenceListAutocompleteSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import ReferenceListAutocomplete from '@/components/referenceListAutocomplete';

export const ReferenceListAutocompleteWrapper: FC<IReferenceListAutocompleteSettingsInputProps> = (props) => {
  const { value, onChange, readOnly, size } = props;
  return (
    <ReferenceListAutocomplete
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      size={size}
    />
  );
};
