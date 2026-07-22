import { IReferenceListAutocompleteSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import ReferenceListAutocomplete from '@/components/referenceListAutocomplete';

export const ReferenceListAutocompleteWrapper: FCUnwrapped<IReferenceListAutocompleteSettingsInputProps> = (props) => {
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
