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
const FilterModeButton = ({ label, mode, filter, onChange }: FilterModeButtonProps) => {
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

export const ExportFilter: FC<IExportFilterProps> = ({ value, onChange }: IExportFilterProps) => {
    return (
        <Row>
            <Col span={12}>
                <Space.Compact block>
                    <FilterModeButton label='Updated' mode='updated' filter={value} onChange={onChange} />
                    <FilterModeButton label='Updated by Me' mode='updated-by-me' filter={value} onChange={onChange} />
                    <FilterModeButton label='All' mode='all' filter={value} onChange={onChange} />
                </Space.Compact>
            </Col>
            <Col span={12}>
                <Input.Search placeholder="search" />
            </Col>
        </Row>
    );
};