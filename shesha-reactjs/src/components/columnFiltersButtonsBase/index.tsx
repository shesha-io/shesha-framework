import React, { FC } from 'react';
import { Button } from 'antd';

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
  return (
    <div className="column-filters-buttons">
      <div className="column-filters-buttons-left">
        {false /*not implemented and temporary removed*/ && toggleSaveFilterModal && (
          <Button size="small" type="default" ghost={true} onClick={() => toggleSaveFilterModal(true)}>
            Save
          </Button>
        )}
      </div>
      <div className="column-filters-buttons-right">
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
