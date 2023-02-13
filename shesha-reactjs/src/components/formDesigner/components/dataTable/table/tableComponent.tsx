import React, { FC, Fragment, useEffect, useState } from 'react';
import { IToolboxComponent } from '../../../../../interfaces';
import { TableOutlined } from '@ant-design/icons';
import { Alert, message } from 'antd';
import { useForm } from '../../../../../providers/form';
import {
  IndexTable,
  CollapsibleSidebarContainer,
  IndexTableColumnFilters,
  IndexTableColumnVisibilityToggle,
  axiosHttp,
  useSheshaApplication,
  useModal,
} from '../../../../../';
import { useDataTableSelection } from '../../../../../providers/dataTableSelection';
import { useDataTableStore, useGlobalState } from '../../../../../providers';
import TableSettings from './tableComponent-settings';
import { ITableComponentProps } from './models';
import { IModalProps } from '../../../../../providers/dynamicModal/models';
import { getStyle } from '../../../../../providers/form/utils';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';

const TableComponent: IToolboxComponent<ITableComponentProps> = {
  type: 'datatable',
  name: 'DataTable',
  icon: <TableOutlined />,
  factory: (model: ITableComponentProps) => {
    return <TableWrapper {...model} />;
  },
  initModel: (model: ITableComponentProps) => {
    return {
      ...model,
      items: [],
    };
  },
  migrator: m =>
    m
      .add<ITableComponentProps>(0, prev => {
        const items = prev['items'] && Array.isArray(prev['items']) ? prev['items'] : [];
        return {
          ...prev,
          items: items,
          useMultiselect: prev['useMultiselect'] ?? false,
          crud: prev['crud'] ?? false,
          flexibleHeight: prev['flexibleHeight'] ?? false,
        };
      })
      .add<ITableComponentProps>(1, migrateV0toV1)
      .add<ITableComponentProps>(2, migrateV1toV2),

  settingsFormFactory: ({ readOnly, model, onSave, onCancel, onValuesChange }) => {
    return (
      <TableSettings
        readOnly={readOnly}
        model={model}
        onSave={onSave}
        onCancel={onCancel}
        onValuesChange={onValuesChange}
      />
    );
  },
};

const NotConfiguredWarning: FC = () => {
  return <Alert className="sha-designer-warning" message="Table is not configured properly" type="warning" />;
};

interface ITableWrapperState {
  modalProps?: IModalProps;
}

export const TableWrapper: FC<ITableComponentProps> = ({
  id,
  items,
  useMultiselect,
  allowRowDragAndDrop,
  onRowDropped,
  rowDroppedMode,
  dialogForm,
  dialogFormSkipFetchData,
  dialogOnSuccessScript,
  dialogOnErrorScript,
  dialogSubmitHttpVerb,
  dialogShowModalButtons,
  dialogTitle,
  tableStyle,
  containerStyle,
}) => {
  const { formMode, formData } = useForm();
  const { globalState } = useGlobalState();
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const { backendUrl } = useSheshaApplication();
  const [state, setState] = useState<ITableWrapperState>({
    modalProps: null,
  });

  const dynamicModal = useModal(state?.modalProps);

  const isDesignMode = formMode === 'designer';

  const {
    entityType,
    isInProgress: { isFiltering, isSelectingColumns },
    setIsInProgressFlag,
    registerConfigurableColumns,
    refreshTable,
    changeActionedRow,
    tableData,
  } = useDataTableStore();

  useEffect(() => {
    // register columns
    const permissibleColumns = isDesignMode
      ? items
      : items?.filter(({ permissions }) => anyOfPermissionsGranted(permissions || []));

    registerConfigurableColumns(id, permissibleColumns);
  }, [items, isDesignMode]);

  useEffect(() => {
    if (state?.modalProps) {
      dynamicModal?.open();
    }
  }, [state]);

  const { selectedRow, setSelectedRow, setMultiSelectedRow } = useDataTableSelection();

  const renderSidebarContent = () => {
    if (isFiltering) {
      return <IndexTableColumnFilters />;
    }

    if (isSelectingColumns) {
      return <IndexTableColumnVisibilityToggle />;
    }

    return <Fragment />;
  };

  /**
   * This expression will be executed when the row has been dropped
   * @param expression - the expression to be executed
   * @param row - the row data that has just been dropped
   * @param oldIndex - the old index of the row
   * @param newIndex - the new index of the row
   * @returns - a function to execute
   */
  const getExpressionExecutor = (expression: string, row: any, oldIndex: number, newIndex: number) => {
    if (!expression) {
      return null;
    }

    // tslint:disable-next-line:function-constructor
    return new Function('row, routes, oldIndex, newIndex, globalState, http, message, data, refreshTable', expression)(
      row,
      tableData,
      oldIndex,
      newIndex,
      globalState,
      axiosHttp(backendUrl),
      message,
      formData,
      refreshTable
    );
  };

  const handleOnRowDropped = (row: any, oldIndex: number, newIndex: number) => {
    changeActionedRow(row);
    if (rowDroppedMode === 'executeScript') {
      getExpressionExecutor(onRowDropped, row, oldIndex, newIndex);
    } else {
      const dialogExpressionExecutor = (expression: string, result?: any) => {
        if (!expression) {
          return null;
        }

        // tslint:disable-next-line:function-constructor
        return new Function('data, result, globalState, http, message, refreshTable', expression)(
          formData,
          result,
          globalState,
          axiosHttp(backendUrl),
          message,
          refreshTable
        );
      };
      setState(prev => ({
        ...prev,
        modalProps: {
          id: dialogForm,
          isVisible: false,
          formId: dialogForm,
          skipFetchData: dialogFormSkipFetchData,
          title: dialogTitle,
          showModalFooter: dialogShowModalButtons,
          submitHttpVerb: dialogSubmitHttpVerb,
          parentFormValues: row,
          onSubmitted: (submittedValue: any) => {
            if (dialogOnSuccessScript) {
              dialogExpressionExecutor(dialogOnSuccessScript, submittedValue);
            }
          },
          onFailed: () => {
            if (dialogOnErrorScript) {
              dialogExpressionExecutor(dialogOnErrorScript);
            }
          },
        },
      }));
    }
  };

  const toggleFieldPropertiesSidebar = () => {
    !isSelectingColumns && !isFiltering
      ? setIsInProgressFlag({ isFiltering: true })
      : setIsInProgressFlag({ isFiltering: false, isSelectingColumns: false });
  };

  if (isDesignMode && !entityType) return <NotConfiguredWarning />;

  const onSelectRow = (index: number, row: any) => {
    if (row) {
      setSelectedRow(index, row);
    }
  };

  return (
    <CollapsibleSidebarContainer
      rightSidebarProps={{
        open: isSelectingColumns || isFiltering,
        onOpen: toggleFieldPropertiesSidebar,
        onClose: toggleFieldPropertiesSidebar,
        title: 'Table Columns',
        content: renderSidebarContent,
      }}
      allowFullCollapse
    >
      <IndexTable
        onSelectRow={onSelectRow}
        onMultiRowSelect={setMultiSelectedRow}
        selectedRowIndex={selectedRow?.index}
        useMultiselect={useMultiselect}
        allowRowDragAndDrop={allowRowDragAndDrop}
        onRowDropped={handleOnRowDropped}
        tableStyle={getStyle(tableStyle, formData, globalState)}
        containerStyle={getStyle(containerStyle, formData, globalState)}
        // crudMode="dialog"
      />
    </CollapsibleSidebarContainer>
  );
};

export default TableComponent;
