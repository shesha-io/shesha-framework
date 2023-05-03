import React, { FC } from 'react';
import { Divider } from 'antd';
import ColumnFilters from '../../columnFilters';
import ColumnsFilterSelect from '../../columnsFilterSelect';
import ColumnFiltersButtons from '../../columnFiltersButtons';
import { useDataTableStore } from 'providers';

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
