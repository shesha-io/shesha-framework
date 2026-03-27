import { IFormAutocompleteSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { FormAutocomplete } from '@/components';

export const FormAutocompleteWrapper: FCUnwrapped<IFormAutocompleteSettingsInputProps> = (props) => {
  const { value, onChange, readOnly, size } = props;
  return (
    <FormAutocomplete
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      size={size ?? 'small'}
    />
  );
};
