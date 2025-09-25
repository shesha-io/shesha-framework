import React, { FC } from 'react';
import { useDataTable } from '@/providers';
import ColumnsFilterSelectBase from '@/components/columnsFilterSelectBase';

export interface IColumnsFilterSelectProps {}

export const ColumnsFilterSelect: FC<IColumnsFilterSelectProps> = () => {
  const { columns, toggleColumnFilter, getCurrentFilter } = useDataTable();

  const appliedFiltersColumnIds = getCurrentFilter().map((f) => f.columnId);
  return <ColumnsFilterSelectBase {...{ columns, appliedFiltersColumnIds, toggleColumnFilter }} />;
};

export default ColumnsFilterSelect;
