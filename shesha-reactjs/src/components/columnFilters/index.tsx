import React, { FC } from 'react';
import { useDataTableStore } from '../../providers';
import ColumnFiltersBase from '../columnFiltersBase';

export interface IColumnFiltersProps {}

export const ColumnFilters: FC<IColumnFiltersProps> = () => {
  const {
    columns,
    tableFilterDirty,
    tableFilter,
    changeFilterOption,
    changeFilter,
    toggleColumnFilter,
    applyFilters,
  } = useDataTableStore();
  const currentFilter = tableFilterDirty || tableFilter || [];
  return (
    <ColumnFiltersBase
      {...{
        columns,
        changeFilterOption,
        changeFilter,
        toggleColumnFilter,
        applyFilters,
      }}
      currentFilter={currentFilter}
    />
  );
};

export default ColumnFilters;
