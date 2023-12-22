import React, { FC, MutableRefObject, Fragment } from 'react';
import { useDataTableStore } from '@/providers';
import { IDataTableInstance } from '@/providers/dataTable/interfaces';
import { DataTable } from '@/components/dataTable';
import { ITableCustomTypeEditor } from '../dataTable/interfaces';
import CollapsiblePanel from '@/components/panel';
import { ChildTableControls } from '@/components/childTableControls';
import DatatableAdvancedFilter from '../dataTable/advancedFilter';
import DatatableColumnsSelector from '../dataTable/columnsSelector';
import { Alert, Drawer } from 'antd';
import { IToolbarItem } from '@/interfaces';

export interface IChildTableProps {
  //entityType: string;
  toolbarItems?: IToolbarItem[];
  header?: string;
  customTypeEditors?: ITableCustomTypeEditor[];
  tableRef?: MutableRefObject<IDataTableInstance | null>;
  onRowsChanged?: (rows: object[]) => void;
  onDblClick?: (data: any) => void;
  /**
   * A callback for when the file export has succeeded
   */
  onExportSuccess?: () => void;

  /**
   * Called when fetch data or refresh is complete is complete
   */
  onFetchDataSuccess?: () => void;
  /**
   * A callback for when the file export has failed
   */
  onExportError?: () => void;
  toolbarItemsPlacement?: 'panelHeader' | 'panelBody';
  alert?: string;
  paginationMode?: 'scroll' | 'pagination';
  crudCreateEntityPickerId?: string;
}

export const ChildDataTable: FC<IChildTableProps> = ({
  header,
  tableRef,
  onRowsChanged,
  onDblClick,
  alert,
  paginationMode = 'scroll',
  customTypeEditors,
  toolbarItems,
  onExportSuccess,
  onFetchDataSuccess,
  onExportError,
}) => {
  const store = useDataTableStore();

  if (tableRef) tableRef.current = store;

  const {
    isInProgress: { isFiltering, isSelectingColumns },
    setIsInProgressFlag,
  } = store;

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
    <div className="sha-child-table">
      <CollapsiblePanel
        header={header}
        extra={
          <div className="sha-child-table-extra">
            <ChildTableControls
              showPagination={paginationMode === 'pagination'}
              toolbarItems={toolbarItems}
            />
          </div>
        }
        noContentPadding
        className="sha-child-table-panel"
      >
        {alert && <Alert type="info" message={alert} />}

        <DataTable
          tableRef={tableRef}
          onRowsChanged={onRowsChanged}
          onDblClick={onDblClick}
          customTypeEditors={customTypeEditors}
          onExportSuccess={onExportSuccess}
          onFetchDataSuccess={onFetchDataSuccess}
          onExportError={onExportError}
        />
      </CollapsiblePanel>

      <Drawer
        title={`Filter Columns / ${header}`}
        placement="right"
        closable={false}
        onClose={toggleFieldPropertiesSidebar}
        visible={isFiltering || isSelectingColumns}
        // getContainer={false}
        style={{ position: 'absolute' }}
        width={320}
      >
        {renderSidebarContent()}
      </Drawer>
    </div>
  );
};

export default ChildDataTable;
