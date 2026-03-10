import React, { FC } from 'react';
import { useDataTableStore } from '@/providers';
import ColumnFiltersButtonsBase from '@/components/columnFiltersButtonsBase';

export const ColumnFiltersButtons: FC = () => {
  const { applyFilters, clearFilters, toggleSaveFilterModal, isFetchingTableData } = useDataTableStore();

  return <ColumnFiltersButtonsBase {...{ applyFilters, clearFilters, toggleSaveFilterModal, isFetchingTableData }} />;
};

export default ColumnFiltersButtons;
