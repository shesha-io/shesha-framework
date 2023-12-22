import React, { FC } from 'react';
import { Divider } from 'antd';
import ColumnFilters from '@/components/columnFilters';
import ColumnsFilterSelect from '@/components/columnsFilterSelect';
import ColumnFiltersButtons from '@/components/columnFiltersButtons';
import { useDataTableStore } from '@/providers';

export interface IDatatableAdvancedFilterProps {}

export const DatatableAdvancedFilter: FC<IDatatableAdvancedFilterProps> = () => {
  const { getCurrentFilter } = useDataTableStore();

  return (
    <div className="sha-index-table-column-filters">
      <ColumnsFilterSelect />

      {getCurrentFilter().length > 0 && <Divider />}

      <ColumnFilters />

      <Divider />

      <ColumnFiltersButtons />
    </div>
  );
};

export default DatatableAdvancedFilter;
