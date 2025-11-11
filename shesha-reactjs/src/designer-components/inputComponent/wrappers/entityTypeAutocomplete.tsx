import { IEntityTypeAutocompleteSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import EntityTypeAutocomplete from '@/components/configurableItemAutocomplete/entityTypeAutocomplete';

export const EntityTypeAutocompleteWrapper: FC<IEntityTypeAutocompleteSettingsInputProps> = (props) => {
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
