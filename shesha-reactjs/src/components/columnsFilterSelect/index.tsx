import React, { FC } from 'react';
import { useDataTableStore } from '@/providers';
import ColumnsFilterSelectBase from '@/components/columnsFilterSelectBase';

export const ColumnsFilterSelect: FC = () => {
  const { columns, toggleColumnFilter, getCurrentFilter, removeColumnFilter } = useDataTableStore();

  const appliedFiltersColumnIds = getCurrentFilter().map((f) => f.columnId);

  const handleToggleColumnFilter = (values: string[]): void => {
    const removed = appliedFiltersColumnIds.filter((id) => !values.includes(id));
    if (removed.length > 0) {
      removed.forEach((id) => removeColumnFilter(id));
    } else {
      toggleColumnFilter(values);
    }
  };

  return <ColumnsFilterSelectBase {...{ columns, appliedFiltersColumnIds, toggleColumnFilter: handleToggleColumnFilter }} />;
};

export default ColumnsFilterSelect;
