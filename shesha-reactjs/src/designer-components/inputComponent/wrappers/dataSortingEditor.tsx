import { SortingEditor } from '@/components/dataTable/sortingConfigurator';
import { IDataSortingEditorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';

export const DataSortingEditorWrapper: FCUnwrapped<IDataSortingEditorSettingsInputProps> = ({ value, onChange, readOnly, maxItemsCount }) => {
  return (
    <SortingEditor
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      maxItemsCount={maxItemsCount}
    />
  );
};
