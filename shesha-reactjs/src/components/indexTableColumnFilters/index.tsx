import React, { FC } from 'react';
import { Divider } from 'antd';
import ColumnFilters from '../columnFilters';
import ColumnsFilterSelect from '../columnsFilterSelect';
import ColumnFiltersButtons from '../columnFiltersButtons';
import { useDataTableStore } from '../../providers';

export interface IIndexTableColumnFiltersProps {}

export const IndexTableColumnFilters: FC<IIndexTableColumnFiltersProps> = () => {
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

export default IndexTableColumnFilters;
