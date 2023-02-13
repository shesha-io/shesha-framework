import React, { FC } from 'react';
import { DownloadOutlined, FilterOutlined, ReloadOutlined, SlidersOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useDataTable } from '../../providers';
import GlobalTableFilter from '../globalTableFilter';
import TablePager from '../tablePager';
import { IToolbarItem } from '../../interfaces/toolbar';
import { nanoid } from 'nanoid/non-secure';

export interface IChildTableControlsProps {
  header?: string;
  showRefreshBtn?: boolean;
  showPagination?: boolean;
  toolbarItems?: IToolbarItem[];
}

export const ChildTableControls: FC<IChildTableControlsProps> = ({
  header,
  showPagination = false,
  toolbarItems,
}) => {
  const {
    isInProgress: { isFiltering, isSelectingColumns, exportToExcel: isExportingToExcel },
    setIsInProgressFlag,
    refreshTable,
    isFetchingTableData,
    exportToExcel,
  } = useDataTable();

  const startFilteringColumns = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation();
    setIsInProgressFlag({ isFiltering: true, isSelectingColumns: false });
  };

  const startTogglingColumnVisibility = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation();
    setIsInProgressFlag({ isSelectingColumns: true, isFiltering: false });
  };

  const handleRefreshData = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation();
    refreshTable();
  };

  const handleExportToExcel = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation();
    exportToExcel();
  };

  return (
    <div className="sha-child-table-controls">
      <div className="index-table-controls-left">
        <div className="index-view-selector">
          <h1 className="title">{header}</h1>
        </div>
      </div>

      <div className="index-table-controls-right">
        <GlobalTableFilter />

        {toolbarItems
          ?.filter(({ hide }) => !hide)
          ?.map(({ className, title, icon, onClick, disabled, render }) => {
            if (render && typeof render === 'function') {
              return render();
            }

            return (
              <Button
                type="link"
                key={nanoid()}
                disabled={disabled}
                onClick={event => {
                  event?.stopPropagation();
                  onClick(event);
                }}
                className={'extra-btn' + className && ` ${className}`}
                icon={icon}
                size="small"
              >
                {title}
              </Button>
            );
          })}

        <Button
          type="link"
          disabled={isExportingToExcel}
          onClick={handleExportToExcel}
          className="extra-btn"
          icon={<DownloadOutlined />}
          size="small"
        >
          Export
        </Button>

        <Button
          type="link"
          disabled={!!isFiltering}
          onClick={startFilteringColumns}
          className="extra-btn filter"
          icon={<FilterOutlined />}
          size="small"
        />

        <Button
          type="link"
          className="extra-btn column-visibility"
          icon={<SlidersOutlined rotate={90} />}
          disabled={!!isSelectingColumns}
          onClick={startTogglingColumnVisibility}
          size="small"
        />

        {showPagination && <TablePager />}

        <Button
          type="link"
          disabled={isFetchingTableData ?? false}
          onClick={handleRefreshData}
          className="extra-btn reload"
          icon={<ReloadOutlined />}
          size="small"
        />
      </div>
    </div>
  );
};

export default ChildTableControls;
