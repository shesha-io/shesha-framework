import { FiltersList } from '@/designer-components/dataTable/tableViewSelector/filters/filtersList';
import { IFiltersListSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';

export const FiltersListWrapper: FC<IFiltersListSettingsInputProps> = (props) => {
  const { readOnly } = props;
  return <FiltersList readOnly={readOnly} {...props} />;
};
