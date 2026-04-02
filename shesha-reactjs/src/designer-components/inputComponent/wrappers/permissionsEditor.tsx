import { IPermissionsSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { PermissionAutocomplete } from '@/components';

export const PermissionsEditorWrapper: FCUnwrapped<IPermissionsSettingsInputProps> = (props) => {
  const { value, onChange, readOnly, size } = props;
  return (
    <PermissionAutocomplete
      value={value}
      readOnly={readOnly}
      onChange={onChange}
      size={size}
    />
  );
};
