import React, { FC, Fragment, useEffect, useRef } from 'react';
import { IToolboxComponent } from 'interfaces';
import { TableOutlined } from '@ant-design/icons';
import { Alert, message } from 'antd';
import { DataTable, CollapsibleSidebarContainer, DatatableAdvancedFilter, DatatableColumnsSelector } from 'components';
import { axiosHttp } from 'utils/fetchers';
import {
  useDataTableStore,
  useGlobalState,
  useDataTableSelection,
  useSheshaApplication,
  useForm,
  useFormData,
  useConfigurableActionDispatcher,
} from 'providers';
import TableSettings from './tableComponent-settings';
import { ITableComponentProps } from './models';
import { getStyle } from 'providers/form/utils';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import moment from 'moment';
import { useDeepCompareEffect } from 'react-use';
import { filterVisibility, getOnRowDroppedAction } from './utils';

const TableComponent: IToolboxComponent<ITableComponentProps> = {
  type: 'datatable',
  name: 'Data Table',
  icon: <TableOutlined />,
  factory: (model: ITableComponentProps) => {
    const store = useDataTableStore(false);

    return store ? (
      <TableWrapper {...model} />
    ) : (
      <Alert
        className="sha-designer-warning"
        message="Data Table must be used within a Data Table Context"
        type="warning"
      />
    );
  },
  initModel: (model: ITableComponentProps) => {
    return {
      ...model,
      items: [],
    };
  },
  migrator: (m) =>
    m
      .add<ITableComponentProps>(0, (prev) => {
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
      .add<ITableComponentProps>(2, migrateV1toV2)
      .add<ITableComponentProps>(3, (prev) => ({
        ...prev,
        canEditInline: 'no',
        inlineEditMode: 'one-by-one',
        inlineSaveMode: 'manual',
        canAddInline: 'no',
        newRowCapturePosition: 'top',
        newRowInsertPosition: 'top',
        canDeleteInline: 'no',
      })),

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

export const TableWrapper: FC<ITableComponentProps> = (props) => {
  const { id, items, useMultiselect, allowRowDragAndDrop, tableStyle, containerStyle, rowDroppedActionConfiguration } =
    props as ITableComponentProps;

  const { formMode, form, setFormDataAndInstance } = useForm();
  const { data: formData } = useFormData();
  const { globalState, setState: setGlobalState } = useGlobalState();
  const { backendUrl, anyOfPermissionsGranted } = useSheshaApplication();
  const { executeAction } = useConfigurableActionDispatcher();

  const isDesignMode = formMode === 'designer';

  const {
    getRepository,
    isInProgress: { isFiltering, isSelectingColumns },
    setIsInProgressFlag,
    registerConfigurableColumns,
    changeActionedRow,
    tableData,
  } = useDataTableStore();
  const repository = getRepository();

  useEffect(() => {
    // register columns
    const permissibleColumns = isDesignMode
      ? items
      : items
          ?.filter(({ permissions }) => anyOfPermissionsGranted(permissions || []))
          .filter(filterVisibility(filterVisibility({ data: formData, globalState })));

    registerConfigurableColumns(id, permissibleColumns);
  }, [items, isDesignMode]);

  const { selectedRow, setSelectedRow, setMultiSelectedRow } = useDataTableSelection();

  const renderSidebarContent = () => {
    if (isFiltering) {
      return <DatatableAdvancedFilter />;
    }

    if (isSelectingColumns) {
      return <DatatableColumnsSelector />;
    }

    return <Fragment />;
  };

  const tableDataItems = useRef(tableData);

  useDeepCompareEffect(() => {
    tableDataItems.current = tableData;
  }, [tableData]);

  if (isDesignMode && !repository) return <NotConfiguredWarning />;

  const handleOnRowDropped = (row: any, oldIndex: number, newIndex: number) => {
    changeActionedRow(row);

    const evaluationContext = {
      items: tableDataItems?.current,
      selectedRow: row,
      newIndex,
      oldIndex,
      data: formData,
      moment: moment,
      form,
      formMode,
      http: axiosHttp(backendUrl),
      message,
      globalState,
      setFormData: setFormDataAndInstance,
      setGlobalState,
    };

    if (rowDroppedActionConfiguration) {
      executeAction({
        actionConfiguration: rowDroppedActionConfiguration,
        argumentsEvaluationContext: evaluationContext,
      });
    } else {
      executeAction(getOnRowDroppedAction(props, evaluationContext));
    }
  };

  const toggleFieldPropertiesSidebar = () => {
    if (!isSelectingColumns && !isFiltering) setIsInProgressFlag({ isFiltering: true });
    else setIsInProgressFlag({ isFiltering: false, isSelectingColumns: false });
  };

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
      <DataTable
        onSelectRow={onSelectRow}
        onMultiRowSelect={setMultiSelectedRow}
        selectedRowIndex={selectedRow?.index}
        useMultiselect={useMultiselect}
        allowRowDragAndDrop={allowRowDragAndDrop}
        onRowDropped={handleOnRowDropped}
        tableStyle={getStyle(tableStyle, formData, globalState)}
        containerStyle={getStyle(containerStyle, formData, globalState)}
        
        canAddInline={props.canAddInline}
        customCreateUrl={props.customCreateUrl}
        newRowCapturePosition={props.newRowCapturePosition}
        onNewRowInitialize={props.onNewRowInitialize}

        canEditInline={props.canEditInline}
        customUpdateUrl={props.customUpdateUrl}

        canDeleteInline={props.canDeleteInline}
        customDeleteUrl={props.customDeleteUrl}

        onRowSave={props.onRowSave}
        onRowSaveSuccess={props.onRowSaveSuccess}
        inlineSaveMode={props.inlineSaveMode}
        inlineEditMode={props.inlineEditMode}
      />
    </CollapsibleSidebarContainer>
  );
};

export default TableComponent;
