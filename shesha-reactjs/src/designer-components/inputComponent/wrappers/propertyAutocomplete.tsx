import { IPropertyAutocompleteSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { PropertyAutocomplete } from '@/components';

export const PropertyAutocompleteWrapper: FC<IPropertyAutocompleteSettingsInputProps> = (props) => {
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
    />
  );
};
