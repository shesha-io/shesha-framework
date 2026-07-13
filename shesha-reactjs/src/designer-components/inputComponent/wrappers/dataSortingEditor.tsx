import { SortingEditor } from '@/components/dataTable/sortingConfigurator';
import { IDataSortingEditorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { ISortingItem } from '@/providers/dataTable/interfaces';

const EMPTY_ON_CHANGE = (_value: ISortingItem[] | null): void => {
  /* noop*/
};

export const DataSortingEditorWrapper: FCUnwrapped<IDataSortingEditorSettingsInputProps> = ({ value, onChange, readOnly, maxItemsCount }) => {
  return (
    <SortingEditor
      value={value}
      onChange={onChange ?? EMPTY_ON_CHANGE}
      readOnly={readOnly}
      maxItemsCount={maxItemsCount}
    />
  );
};
