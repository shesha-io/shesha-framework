import React, { FC } from 'react';
import { Divider } from 'antd';
import ColumnFilters from '@/components/columnFilters';
import ColumnsFilterSelect from '@/components/columnsFilterSelect';
import ColumnFiltersButtons from '@/components/columnFiltersButtons';
import { useDataTableStore } from '@/providers';
import { useStyles } from './styles/styles';

export const DatatableAdvancedFilter: FC = () => {
  const { getCurrentFilter } = useDataTableStore();
  const { styles } = useStyles();

  return (
    <div className={styles.shaIndexTableColumnFilters}>
      <ColumnsFilterSelect />

      {getCurrentFilter().length > 0 && <Divider />}

      <ColumnFilters />

      <Divider />

      <ColumnFiltersButtons />
    </div>
  );
};

export default DatatableAdvancedFilter;
