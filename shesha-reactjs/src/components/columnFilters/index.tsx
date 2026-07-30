import React, { FC } from 'react';
import { useDataTableStore } from '@/providers';
import ColumnFiltersBase from '@/components/columnFiltersBase';

export const ColumnFilters: FC = () => {
  const {
    columns,
    tableFilterDirty,
    tableFilter,
    changeFilterOption,
    changeFilter,
    toggleColumnFilter,
    applyFilters,
    removeColumnFilter,
  } = useDataTableStore();
  const currentFilter = tableFilterDirty ?? tableFilter;
  return (
    <ColumnFiltersBase
      {...{
        columns,
        changeFilterOption,
        changeFilter,
        toggleColumnFilter,
        applyFilters,
        removeColumnFilter,
      }}
      currentFilter={currentFilter}
    />
  );
};

export default ColumnFilters;
