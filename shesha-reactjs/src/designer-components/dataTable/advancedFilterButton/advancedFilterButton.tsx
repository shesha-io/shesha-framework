import React, { FC } from 'react';
import { Badge, Button } from 'antd';
import { FilterFilled, FilterOutlined } from '@ant-design/icons';
import { useDataTableStore } from '@/providers';
import { useStyles } from './style';



export const AdvancedFilterButton: FC = () => {
    const {
        isInProgress: { isFiltering },
        setIsInProgressFlag, tableFilter
    } = useDataTableStore();

    const { styles } = useStyles();
    const startFilteringColumns = () => setIsInProgressFlag({ isFiltering: true, isSelectingColumns: false });

    const filterColumns = tableFilter?.map((filter) => filter.columnId);
    const hasFilters = filterColumns?.length > 0 || isFiltering;
    const buttonStyle = {
        color: styles.primaryColor,
        border: `1px solid ${styles.primaryColor}`,
    };

    return (
        <Badge count={tableFilter?.length} color={isFiltering ? styles.buttonDisabledColor : styles.primaryColor} size='small' title={filterColumns?.join("  ")}>
            <Button
                type="default"
                onClick={startFilteringColumns}
                className="extra-btn filter"
                disabled={isFiltering}
                icon={hasFilters ? <FilterFilled color={styles.primaryColor} /> : <FilterOutlined color={styles.primaryColor} />}
                size="middle"
                style={isFiltering ? {} : buttonStyle}
            />
        </Badge>


    );
};