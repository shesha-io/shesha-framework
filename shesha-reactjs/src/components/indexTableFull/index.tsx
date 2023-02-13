import React, { FC, Fragment, ReactNode } from 'react';
import { IndexTableControls } from '../indexTableControls';
import CollapsibleSidebarContainer from '../collapsibleSidebarContainer';
import IndexTable from '../indexTable';
import { IShaDataTableProps } from '../indexTable/interfaces';
import { useDataTableStore } from '../../providers';
import IndexTableColumnFilters from '../indexTableColumnFilters';
import IndexTableColumnVisibilityToggle from '../indexTableColumnVisibilityToggle';
import TablePager from '../tablePager';
import { IToolbarItem } from '../../interfaces';
import IndexToolbar from '../indexToolbar';
import { DownloadOutlined } from '@ant-design/icons';

export interface IIndexTableFullProps extends IShaDataTableProps {
  toolbarItems?: IToolbarItem[];
  paginationPlacement?: 'top' | 'bottom';
  toolbarExtra?: ReactNode;
}

export const IndexTableFull: FC<IIndexTableFullProps> = ({
  useMultiselect,
  actionColumns,
  selectedRowIndex,
  onSelectRow,
  customTypeRenders,
  disableCustomFilters,
  header,
  paginationPlacement = 'top',
  toolbarItems,
  toolbarExtra,
  tableRef,
  onExportSuccess,
  onExportError,
  onSelectedIdsChanged,
}) => {
  const {
    isInProgress: { isFiltering, isSelectingColumns, exportToExcel: isExportingToExcel },
    setIsInProgressFlag,
    exportToExcel,
  } = useDataTableStore();

  const toggleFieldPropertiesSidebar = () =>
    !isSelectingColumns && !isFiltering
      ? setIsInProgressFlag({ isFiltering: true })
      : setIsInProgressFlag({ isFiltering: false, isSelectingColumns: false });

  const renderSidebarContent = () => {
    if (isFiltering) {
      return <IndexTableColumnFilters />;
    }

    if (isSelectingColumns) {
      return <IndexTableColumnVisibilityToggle />;
    }

    return <Fragment />;
  };

  return (
    <div className="sha-index-table-full">
      <IndexTableControls
        header={header}
        disableCustomFilters={disableCustomFilters}
        showPagination={paginationPlacement === 'top'}
      />

      <IndexToolbar
        items={[
          ...(toolbarItems || []),
          {
            title: 'Export',
            icon: <DownloadOutlined />,
            onClick: exportToExcel,
            disabled: isExportingToExcel,
          },
        ]}
        elementsRight={toolbarExtra}
        className="sha-index-toolbar-full-table"
      />

      <CollapsibleSidebarContainer
        rightSidebarProps={{
          open: isSelectingColumns || isFiltering,
          onOpen: toggleFieldPropertiesSidebar,
          onClose: toggleFieldPropertiesSidebar,
          title: 'Filters And Table Columns',
          content: renderSidebarContent,
        }}
        allowFullCollapse
      >
        <IndexTable
          useMultiselect={useMultiselect}
          actionColumns={actionColumns}
          selectedRowIndex={selectedRowIndex}
          onSelectRow={onSelectRow}
          onExportSuccess={onExportSuccess}
          onExportError={onExportError}
          onSelectedIdsChanged={onSelectedIdsChanged}
          customTypeRenders={customTypeRenders}
          tableRef={tableRef}
        />

        {paginationPlacement === 'bottom' && (
          <div className="sha-index-table-full-bottom-pagination">
            <TablePager />
          </div>
        )}
      </CollapsibleSidebarContainer>
    </div>
  );
};

export default IndexTableFull;
