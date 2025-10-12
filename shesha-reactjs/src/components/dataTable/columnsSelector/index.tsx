import Checkbox from 'antd/lib/checkbox/Checkbox';
import Search from 'antd/lib/input/Search';
import { nanoid } from '@/utils/uuid';
import React, { ChangeEvent, FC, useState } from 'react';
import { useDataTable } from '@/providers';
import { getSafelyTrimmedString } from '@/utils';
import { useStyles } from './styles/styles';

export const DatatableColumnsSelector: FC = () => {
  const { styles } = useStyles();
  const { columns, toggleColumnVisibility } = useDataTable();

  const visibleColumns = columns.filter((c) => c.isVisible === true && c.allowShowHide === true);

  const [columnFilter, setColumnFilter] = useState('');

  const onColumnSearch = ({ target: { value } }: ChangeEvent<HTMLInputElement>): void => {
    setColumnFilter(value ? value?.toLowerCase() : '');
  };

  return (
    <div className={styles.shaIndexTableColumnVisibilityToggle}>
      <Search placeholder="Search columns" allowClear onChange={onColumnSearch} size="small" />

      <div className={styles.columnNames}>
        {(columnFilter
          ? visibleColumns.filter(
            ({ header }) =>
              getSafelyTrimmedString(header)
                ?.toLowerCase()
                ?.includes(getSafelyTrimmedString(columnFilter)?.toLowerCase()),
          )
          : visibleColumns
        ).map(({ header, show, id }) => {
          return (
            <div key={nanoid()} className={styles.columnName} onClick={() => toggleColumnVisibility(id)}>
              <Checkbox checked={show}>{header}</Checkbox>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DatatableColumnsSelector;
