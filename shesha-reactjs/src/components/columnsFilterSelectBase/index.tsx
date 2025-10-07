import React, { FC } from 'react';
import { Select } from 'antd';
import { ITableColumn } from '@/providers/dataTable/interfaces';
import { nanoid } from '@/utils/uuid';
import { useStyles } from './styles/styles';

const { Option } = Select;

export interface IColumnsFilterSelectBaseProps {
  columns: ITableColumn[];
  appliedFiltersColumnIds: string[];
  toggleColumnFilter: (ids: string[]) => void;
}

export const ColumnsFilterSelectBase: FC<IColumnsFilterSelectBaseProps> = ({
  columns,
  appliedFiltersColumnIds,
  toggleColumnFilter,
}) => {
  const { styles } = useStyles();
  const handleToggleColumnFilter = (values: string[]): void => {
    toggleColumnFilter(values); // There will always be one new element
  };

  const filterOption = (inputValue: string, option: any): boolean =>
    (option.props.children as string).toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;

  return (
    <div className={styles.columnsFilterSelect}>
      <span className="label">Filter by</span>
      <Select
        allowClear
        size="small"
        mode="multiple"
        onChange={handleToggleColumnFilter}
        value={appliedFiltersColumnIds}
        className="columns-filter-selector"
        filterOption={filterOption}
      >
        {columns
          .filter(({ isFilterable }) => isFilterable)
          .map(({ id, header }) => (
            <Option value={id} key={nanoid()}>
              {header}
            </Option>
          ))}
      </Select>
    </div>
  );
};

export default ColumnsFilterSelectBase;
