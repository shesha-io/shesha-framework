import { ISizableColumnsConfigSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import SizableColumnsList from '@/designer-components/sizableColumns/sizableColumnList';
import React, { FC } from 'react';

export const SizableColumnsConfigWrapper: FC<ISizableColumnsConfigSettingsInputProps> = (props) => {
  const { readOnly } = props;
  return <SizableColumnsList {...props} readOnly={readOnly} />;
};
