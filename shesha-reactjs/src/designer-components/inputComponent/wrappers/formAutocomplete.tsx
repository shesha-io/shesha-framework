import { IFormAutocompleteSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { FormAutocomplete } from '@/components';

export const FormAutocompleteWrapper: FC<IFormAutocompleteSettingsInputProps> = (props) => {
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
