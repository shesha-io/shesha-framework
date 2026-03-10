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
