import { IEntityTypeAutocompleteSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import EntityTypeAutocomplete from '@/components/configurableItemAutocomplete/entityTypeAutocomplete';

export const EntityTypeAutocompleteWrapper: FCUnwrapped<IEntityTypeAutocompleteSettingsInputProps> = (props) => {
  const { value, onChange, readOnly, size, entityAutocompleteType } = props;
  return (
    <EntityTypeAutocomplete
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      type={entityAutocompleteType}
      size={size}
    />
  );
};
