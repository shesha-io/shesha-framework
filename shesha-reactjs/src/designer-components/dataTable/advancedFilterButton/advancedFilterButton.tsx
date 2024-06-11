import React, { FC } from 'react';
import { Badge, Button } from 'antd';
import { FilterFilled, FilterOutlined } from '@ant-design/icons';
import { useDataTableStore } from '@/providers';
import { useStyles } from './style';



export const AdvancedFilterButton: FC = () => {
    const {
        isInProgress: { isFiltering },
        setIsInProgressFlag, tableFilter,
    } = useDataTableStore();

    const { styles } = useStyles();
    const startFilteringColumns = () => setIsInProgressFlag({ isFiltering: true, isSelectingColumns: false });
    const filterColumns = tableFilter.map((filter) => filter.columnId);
    const hasFilters = filterColumns.length > 0 || isFiltering;

    return (
        <Badge count={tableFilter.length} color={styles.primaryColor} size="small" title={filterColumns.join("  ")}>
            <Button
                type="link"
                onClick={startFilteringColumns}
                className="extra-btn filter"
                disabled={isFiltering}
                icon={hasFilters ? <FilterFilled color={styles.primaryColor} /> : <FilterOutlined color={styles.primaryColor} />}
                size="small"
                style={{ border: hasFilters ? `1px solid ${styles.primaryColor}` : "none" }}
            />
        </Badge>

    );
};