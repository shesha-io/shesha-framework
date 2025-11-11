import { SortingEditor } from '@/components/dataTable/sortingConfigurator';
import { IDataSortingEditorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';

export const DataSortingEditorWrapper: FC<IDataSortingEditorSettingsInputProps> = ({ value, onChange, readOnly, maxItemsCount }) => {
  return (
    <SortingEditor
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      maxItemsCount={maxItemsCount}
    />
  );
};
