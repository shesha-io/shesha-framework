import { IColumnsListSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import ColumnsList from '../../columns/columnsList';

export const ColumnsListWrapper: FCUnwrapped<IColumnsListSettingsInputProps> = (props) => {
  const { value, onChange, readOnly } = props;
  return (
    <ColumnsList
      {...props}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
    />
  );
};
