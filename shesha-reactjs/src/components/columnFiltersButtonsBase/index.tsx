import React, { FC } from 'react';
import { Button } from 'antd';
import { useStyles } from './styles/styles';

export interface IColumnFiltersButtonsBaseProps {
  applyFilters: () => void;
  clearFilters: () => void;
  toggleSaveFilterModal: (visible: boolean) => void;
  isFetchingTableData: boolean;
}

export const ColumnFiltersButtonsBase: FC<IColumnFiltersButtonsBaseProps> = ({
  applyFilters,
  clearFilters,
  toggleSaveFilterModal,
  isFetchingTableData,
}) => {
  const { styles } = useStyles();
  return (
    <div className={styles.columnFiltersButtons}>
      <div className={styles.columnFiltersButtonsLeft}>
        {false /* not implemented and temporary removed*/ && toggleSaveFilterModal && (
          <Button size="small" type="default" ghost={true} onClick={() => toggleSaveFilterModal(true)}>
            Save
          </Button>
        )}
      </div>
      <div className={styles.columnFiltersButtonsRight}>
        <Button size="small" type="default" ghost={true} onClick={clearFilters}>
          Clear
        </Button>

        <Button size="small" type="primary" onClick={applyFilters} loading={isFetchingTableData}>
          Apply
        </Button>
      </div>
    </div>
  );
};

export default ColumnFiltersButtonsBase;
