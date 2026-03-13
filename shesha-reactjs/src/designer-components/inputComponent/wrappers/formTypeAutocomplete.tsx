import { IFormTypeAutocompleteSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { FCUnwrapped } from '@/providers';
import { AutoComplete } from 'antd';
import React, { useState } from 'react';

const formTypes = ['Table', 'Create', 'Edit', 'Details', 'Quickview', 'ListItem', 'Picker'];

export const FormTypeAutocompleteWrapper: FCUnwrapped<IFormTypeAutocompleteSettingsInputProps> = (props) => {
  const { value, onChange, readOnly, size } = props;
  const [formTypesOptions, setFormTypesOptions] = useState<{ value: string }[]>(
    formTypes.map((i) => {
      return { value: i };
    }),
  );
  return (
    <AutoComplete
      value={value}
      onChange={onChange}
      disabled={readOnly}

      options={formTypesOptions}
      size={size ?? 'small'}
      onSearch={(t) =>
        setFormTypesOptions(
          (t
            ? formTypes.filter((f) => {
              return f.toLowerCase().includes(t.toLowerCase());
            })
            : formTypes
          ).map((i) => {
            return { value: i };
          }),
        )}
    />
  );
};
