import { IColumnsConfigSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { ColumnsConfig } from '@/designer-components/dataTable/table/columnsEditor/columnsConfig';

export const ColumnsConfigWrapper: FC<IColumnsConfigSettingsInputProps> = (props) => {
  return <ColumnsConfig {...props} />;
};
