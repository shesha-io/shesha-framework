import { FC } from 'react';
import { useDataTableStore } from '@/providers';
import ColumnFiltersButtonsBase from '@/components/columnFiltersButtonsBase';

const ColumnFiltersButtons: FC = () => {
  const { applyFilters, clearFilters, isFetchingTableData } = useDataTableStore();

  return <ColumnFiltersButtonsBase {...{ applyFilters, clearFilters, isFetchingTableData }} />;
};

export default ColumnFiltersButtons;
