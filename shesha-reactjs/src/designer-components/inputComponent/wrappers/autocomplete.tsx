import { Autocomplete } from '@/components';
import { IAutocompleteSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';

export const AutocompleteWrapper: FCUnwrapped<IAutocompleteSettingsInputProps> = (props) => {
  const { value, readOnly, size, placeholder, dataSourceType, dataSourceUrl } = props;
  return (
    <Autocomplete
      value={value}
      readOnly={readOnly}

      dataSourceType={dataSourceType}
      dataSourceUrl={dataSourceUrl}
      placeholder={placeholder}
      size={size}
      {...props}
      style={{}}
    />
  );
};
