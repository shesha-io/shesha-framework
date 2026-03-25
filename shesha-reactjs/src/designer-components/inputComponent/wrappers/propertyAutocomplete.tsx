import { IPropertyAutocompleteSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { PropertyAutocomplete } from '@/components';

export const PropertyAutocompleteWrapper: FCUnwrapped<IPropertyAutocompleteSettingsInputProps> = (props) => {
  const { value, onChange, readOnly, size, autoFillProps, allowClear, mode, id } = props;
  return (
    <PropertyAutocomplete
      value={value}
      onChange={onChange}
      readOnly={readOnly}

      id={id}
      size={size}
      mode={mode}
      autoFillProps={autoFillProps ?? true}
      allowClear={allowClear ?? true}

      propertyModelType={props.propertyModelType}
    />
  );
};
