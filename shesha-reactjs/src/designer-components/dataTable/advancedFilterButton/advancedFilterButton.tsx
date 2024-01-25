import React, { FC } from 'react';
import { Button } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { useDataTableStore } from '@/providers';

export const AdvancedFilterButton: FC = ({ }) => {
    const {
        isInProgress: { isFiltering },
        setIsInProgressFlag,
    } = useDataTableStore();

    const startFilteringColumns = () => setIsInProgressFlag({ isFiltering: true, isSelectingColumns: false });

    return (
        <Button
            type="link"
            disabled={!!isFiltering}
            onClick={startFilteringColumns}
            className="extra-btn filter"
            icon={<FilterOutlined />}
            size="small"
        />
    );
};