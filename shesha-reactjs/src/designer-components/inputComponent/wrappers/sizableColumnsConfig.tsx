import { ISizableColumnsConfigSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import SizableColumnsList from '@/designer-components/sizableColumns/sizableColumnList';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';

export const SizableColumnsConfigWrapper: FCUnwrapped<ISizableColumnsConfigSettingsInputProps> = (props) => {
  const { readOnly } = props;
  return <SizableColumnsList {...props} readOnly={readOnly} />;
};
