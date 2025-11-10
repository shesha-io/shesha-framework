import { IColumnsListSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import ColumnsList from '../../columns/columnsList';

export const ColumnsListWrapper: FC<IColumnsListSettingsInputProps> = (props) => {
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
