import { IColumnsConfigSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { ColumnsConfig } from '@/designer-components/dataTable/table/columnsEditor/columnsConfig';

export const ColumnsConfigWrapper: FCUnwrapped<IColumnsConfigSettingsInputProps> = (props) => {
  return <ColumnsConfig {...props} />;
};
