import { IPropertyAutocompleteSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { PropertyAutocomplete } from '@/components/propertyAutocomplete/propertyAutocomplete';

export const PropertyAutocompleteWrapper: FCUnwrapped<IPropertyAutocompleteSettingsInputProps> = (props) => {
  const { value, onChange, readOnly = false, size, autoFillProps, allowClear, mode } = props;
  return (
    <PropertyAutocomplete
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      size={size}
      mode={mode}
      autoFillProps={autoFillProps ?? true}
      allowClear={allowClear ?? true}
      propertyModelType={props.propertyModelType}
    />
  );
};
