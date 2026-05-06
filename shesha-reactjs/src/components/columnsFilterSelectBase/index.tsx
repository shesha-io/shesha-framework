import React, { FC } from 'react';
import { Select } from 'antd';
import { ITableColumn } from '@/providers/dataTable/interfaces';
import { useStyles } from './styles/styles';
import { DefaultOptionType } from 'antd/lib/select';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

export interface IColumnsFilterSelectBaseProps {
  columns: ITableColumn[];
  appliedFiltersColumnIds: string[];
  toggleColumnFilter: (ids: string[]) => void;
}

const columnsToOptions = (columns: ITableColumn[]): DefaultOptionType[] => {
  const result: DefaultOptionType[] = [];
  columns.forEach((column) => {
    if (column.isFilterable && !isNullOrWhiteSpace(column.id))
      result.push({ value: column.id, label: column.header });
  });
  return result;
};

export const ColumnsFilterSelectBase: FC<IColumnsFilterSelectBaseProps> = ({
  columns,
  appliedFiltersColumnIds,
  toggleColumnFilter,
}) => {
  const { styles } = useStyles();
  const handleToggleColumnFilter = (values: string[]): void => {
    toggleColumnFilter(values); // There will always be one new element
  };

  const options = columnsToOptions(columns);

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
        showSearch={{ filterOption: (inputValue, option) => {
          return isDefined(option) && typeof (option.label) === "string" && option.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
        } }}
        options={options}
      />
    </div>
  );
};

export default ColumnsFilterSelectBase;
