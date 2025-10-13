import React, { FC } from 'react';
import { useDataTable } from '@/providers';
import ColumnsFilterSelectBase from '@/components/columnsFilterSelectBase';

export const ColumnsFilterSelect: FC = () => {
  const { columns, toggleColumnFilter, getCurrentFilter } = useDataTable();

  const appliedFiltersColumnIds = getCurrentFilter().map((f) => f.columnId);
  return <ColumnsFilterSelectBase {...{ columns, appliedFiltersColumnIds, toggleColumnFilter }} />;
};

export default ColumnsFilterSelect;
