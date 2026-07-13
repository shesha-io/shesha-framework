import React, { FC } from 'react';
import { useDataTableStore } from '@/providers';
import ColumnsFilterSelectBase from '@/components/columnsFilterSelectBase';

export const ColumnsFilterSelect: FC = () => {
  const { columns, toggleColumnFilter, getCurrentFilter } = useDataTableStore();

  const appliedFiltersColumnIds = getCurrentFilter().map((f) => f.columnId);
  return <ColumnsFilterSelectBase {...{ columns, appliedFiltersColumnIds, toggleColumnFilter }} />;
};

export default ColumnsFilterSelect;
