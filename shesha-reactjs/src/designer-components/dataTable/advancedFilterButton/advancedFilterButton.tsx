import React, { FC } from 'react';
import { Badge, Button, Flex } from 'antd';
import { FilterFilled, FilterOutlined, SlidersFilled, SlidersOutlined } from '@ant-design/icons';
import { useDataTableStore } from '@/providers';
import { useStyles } from './style';



export const AdvancedFilterButton: FC = () => {
    const {
        isInProgress: { isFiltering, isSelectingColumns },
        setIsInProgressFlag, tableFilter, userSorting
    } = useDataTableStore();

    const { styles } = useStyles();
    const startFilteringColumns = () => setIsInProgressFlag({ isFiltering: true, isSelectingColumns: false });
    const startSortingColumns = () => {
        setIsInProgressFlag({ isFiltering: false, isSelectingColumns: true })
        console.log('startSortingColumns: ', userSorting)
    }; userSorting
    const filterColumns = tableFilter?.map((filter) => filter.columnId);
    const hasFilters = filterColumns?.length > 0 || isFiltering;

    return (
        <Flex gap="middle" vertical={false}>
            <Button
                type="link"
                size="middle"
                onClick={startSortingColumns}
                className="extra-btn filter"
                disabled={isSelectingColumns}
                icon={!userSorting ? <SlidersOutlined color={styles.primaryColor} /> : <SlidersFilled color={styles.primaryColor} />}
                style={{ border: userSorting ? `1px solid ${isSelectingColumns ? "#b4b4b4" : styles.primaryColor}` : "none" }}
            />
            <Badge count={tableFilter?.length} color={isFiltering ? styles.buttonDisabledColor : styles.primaryColor} size='small' title={filterColumns?.join("  ")}>
                <Button
                    type="link"
                    onClick={startFilteringColumns}
                    className="extra-btn filter"
                    disabled={isFiltering}
                    icon={hasFilters ? <FilterFilled color={styles.primaryColor} /> : <FilterOutlined color={styles.primaryColor} />}
                    size="middle"
                    style={{ border: hasFilters ? `1px solid ${isFiltering ? "#b4b4b4" : styles.primaryColor}` : "none", background: isFiltering || !hasFilters ? "none" : styles.secondaryColor }}
                />
            </Badge>
        </Flex>


    );
};