import React, { FC, Fragment, ReactNode } from 'react';
import { IndexTableControls } from '@/components/indexTableControls';
import CollapsibleSidebarContainer from '@/components/collapsibleSidebarContainer';
import { DataTable } from '@/components/dataTable';
import { IShaDataTableProps } from '../dataTable/interfaces';
import { useDataTableStore } from '@/providers';
import DatatableAdvancedFilter from '../dataTable/advancedFilter';
import DatatableColumnsSelector from '../dataTable/columnsSelector';
import TablePager from '@/components/tablePager';
import { IToolbarItem } from '@/interfaces';
import IndexToolbar from '@/components/indexToolbar';
import { DownloadOutlined } from '@ant-design/icons';

export interface IIndexTableFullProps extends IShaDataTableProps {
  toolbarItems?: IToolbarItem[];
  paginationPlacement?: 'top' | 'bottom';
  toolbarExtra?: ReactNode;
}

export const IndexTableFull: FC<IIndexTableFullProps> = ({
  useMultiselect,
  selectedRowIndex,
  onSelectRow,
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
      return <DatatableAdvancedFilter />;
    }

    if (isSelectingColumns) {
      return <DatatableColumnsSelector />;
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
        <DataTable
          useMultiselect={useMultiselect}
          selectedRowIndex={selectedRowIndex}
          onSelectRow={onSelectRow}
          onExportSuccess={onExportSuccess}
          onExportError={onExportError}
          onSelectedIdsChanged={onSelectedIdsChanged}
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
