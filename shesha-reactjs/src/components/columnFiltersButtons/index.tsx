import React, { FC } from 'react';
import { useDataTableStore } from '../../providers';
import ColumnFiltersButtonsBase from '@/components/columnFiltersButtonsBase';

export interface IColumnFiltersButtonsProps {}

export const ColumnFiltersButtons: FC<IColumnFiltersButtonsProps> = () => {
  const { applyFilters, clearFilters, toggleSaveFilterModal, isFetchingTableData } = useDataTableStore();

  return <ColumnFiltersButtonsBase {...{ applyFilters, clearFilters, toggleSaveFilterModal, isFetchingTableData }} />;
};

export default ColumnFiltersButtons;
