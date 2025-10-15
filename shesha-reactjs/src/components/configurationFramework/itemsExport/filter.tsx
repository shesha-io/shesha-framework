import React, { FC } from 'react';
import { FilterState, ItemsSelectionMode } from './models';
import { Button, Col, Input, Row, Space } from 'antd';

export interface IExportFilterProps {
  value: FilterState;
  onChange: (newValue: FilterState) => void;
}

type FilterModeButtonProps = {
  label: string;
  mode: ItemsSelectionMode;
  filter: FilterState;
  onChange: (newValue: FilterState) => void;
};
const FilterModeButton = ({ label, mode, filter, onChange }: FilterModeButtonProps): JSX.Element => {
  return (
    <Button
      type={mode === filter.mode ? 'primary' : 'default'}
      onClick={() => {
        onChange({ ...filter, mode: mode });
      }}
    >
      {label}
    </Button>
  );
};

export const ExportFilter: FC<IExportFilterProps> = ({ value: filterValue, onChange: onFilterChange }: IExportFilterProps) => {
  return (
    <Row>
      <Col span={12}>
        <Space.Compact block>
          <FilterModeButton label="Updated" mode="updated" filter={filterValue} onChange={onFilterChange} />
          <FilterModeButton label="Updated by Me" mode="updated-by-me" filter={filterValue} onChange={onFilterChange} />
          <FilterModeButton label="All" mode="all" filter={filterValue} onChange={onFilterChange} />
        </Space.Compact>
      </Col>
      <Col span={12}>
        <Input.Search
          placeholder="search"
          value={filterValue?.quickSearch}
          onChange={(e) => {
            const { value } = e.target;
            onFilterChange({ ...filterValue, quickSearch: value });
          }}
        />
      </Col>
    </Row>
  );
};
