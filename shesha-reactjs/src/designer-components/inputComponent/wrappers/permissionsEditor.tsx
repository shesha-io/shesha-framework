import { IPermissionsSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { PermissionAutocomplete } from '@/components';

export const PermissionsEditorWrapper: FC<IPermissionsSettingsInputProps> = (props) => {
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
