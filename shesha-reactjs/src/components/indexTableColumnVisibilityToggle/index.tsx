import Checkbox from 'antd/lib/checkbox/Checkbox';
import Search from 'antd/lib/input/Search';
import React, { ChangeEvent, FC, useState } from 'react';
import { useDataTable } from '../../providers';
import { getSafelyTrimmedString } from '../../utils';
import { nanoid } from 'nanoid/non-secure';

export interface IIndexTableColumnVisibilityToggleProps {}

export const IndexTableColumnVisibilityToggle: FC<IIndexTableColumnVisibilityToggleProps> = () => {
  const { columns, toggleColumnVisibility } = useDataTable();

  const visibleColumns = columns.filter(c => c.isVisible === true && c.allowShowHide === true);

  const [columnFilter, setColumnFilter] = useState('');

  const onColumnSearch = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setColumnFilter(value ? value?.toLowerCase() : '');
  };

  return (
    <div className="sha-index-table-column-visibility-toggle">
      <Search placeholder="Search columns" allowClear onChange={onColumnSearch} size="small" />

      <div className="column-names">
        {(columnFilter
          ? visibleColumns.filter(({ header }) =>
              getSafelyTrimmedString(header)
                ?.toLowerCase()
                ?.includes(getSafelyTrimmedString(columnFilter)?.toLowerCase())
            )
          : visibleColumns
        ).map(({ header, show, id }) => {
          return (
            <div key={nanoid()} className="column-name" onClick={() => toggleColumnVisibility(id)}>
              <Checkbox checked={show}>{header}</Checkbox>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IndexTableColumnVisibilityToggle;
