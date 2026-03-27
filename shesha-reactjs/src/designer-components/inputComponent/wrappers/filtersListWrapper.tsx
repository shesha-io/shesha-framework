import { FiltersList } from '@/designer-components/dataTable/tableViewSelector/filters/filtersList';
import { IFiltersListSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';

export const FiltersListWrapper: FCUnwrapped<IFiltersListSettingsInputProps> = (props) => {
  const { readOnly } = props;
  return <FiltersList readOnly={readOnly} {...props} />;
};
