import React, {
    FC,
    Fragment,
    useEffect,
    useRef
} from 'react';
import { filterVisibility } from './utils';
import { getStyle } from '@/providers/form/utils';
import { ITableComponentProps } from './models';
import { useDeepCompareEffect } from 'react-use';
import {
    SidebarContainer,
    DataTable,
    DatatableAdvancedFilter,
    DatatableColumnsSelector,
} from '@/components';
import {
    useDataTableStore,
    useForm,
    useFormData,
    useGlobalState,
    useSheshaApplication,
} from '@/providers';
import { GlobalTableStyles } from './styles/styles';
import { Alert } from 'antd';

const NotConfiguredWarning: FC = () => {
    return <Alert className="sha-designer-warning" message="Table is not configured properly" type="warning" />;
};


export const TableWrapper: FC<ITableComponentProps> = (props) => {
    const { id, items, useMultiselect, tableStyle, containerStyle } = props;
    
    const { formMode } = useForm();
    const { data: formData } = useFormData();
    const { globalState } = useGlobalState();
    const { anyOfPermissionsGranted } = useSheshaApplication();

    const isDesignMode = formMode === 'designer';

    const {
        getRepository,
        isInProgress: { isFiltering, isSelectingColumns },
        setIsInProgressFlag,
        registerConfigurableColumns,
        tableData,
        selectedRow,
        setMultiSelectedRow,
        requireColumns,
        allowReordering,
    } = useDataTableStore();

    requireColumns(); // our component requires columns loading. it's safe to call on each render

    const repository = getRepository();

    useEffect(() => {
        // register columns
        const permissibleColumns = isDesignMode
            ? items
            : items
                ?.filter(({ permissions }) => anyOfPermissionsGranted(permissions || []))
                .filter(filterVisibility({ data: formData, globalState }));

        registerConfigurableColumns(id, permissibleColumns);
    }, [items, isDesignMode]);

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

    const toggleFieldPropertiesSidebar = () => {
        if (!isSelectingColumns && !isFiltering) setIsInProgressFlag({ isFiltering: true });
        else setIsInProgressFlag({ isFiltering: false, isSelectingColumns: false });
    };

    return (
        <SidebarContainer
            rightSidebarProps={{
                onOpen: toggleFieldPropertiesSidebar,
                open: Boolean(isSelectingColumns || isFiltering),
                onClose: toggleFieldPropertiesSidebar,
                title: 'Table Columns',
                content: renderSidebarContent,
            }}
            allowFullCollapse
        >
            <GlobalTableStyles />
            <DataTable
                onMultiRowSelect={setMultiSelectedRow}
                selectedRowIndex={selectedRow?.index}
                useMultiselect={useMultiselect}
                freezeHeaders={props.freezeHeaders}
                allowReordering={allowReordering}
                tableStyle={getStyle(tableStyle, formData, globalState)}
                containerStyle={getStyle(containerStyle, formData, globalState)}
                canAddInline={props.canAddInline}
                canAddInlineExpression={props.canAddInlineExpression}
                customCreateUrl={props.customCreateUrl}
                newRowCapturePosition={props.newRowCapturePosition}
                onNewRowInitialize={props.onNewRowInitialize}
                canEditInline={props.canEditInline}
                canEditInlineExpression={props.canEditInlineExpression}
                customUpdateUrl={props.customUpdateUrl}
                canDeleteInline={props.canDeleteInline}
                canDeleteInlineExpression={props.canDeleteInlineExpression}
                customDeleteUrl={props.customDeleteUrl}
                onRowSave={props.onRowSave}
                onRowSaveSuccessAction={props.onRowSaveSuccessAction}
                inlineSaveMode={props.inlineSaveMode}
                inlineEditMode={props.inlineEditMode}
                minHeight={props.minHeight}
                maxHeight={props.maxHeight}
                noDataText={props.noDataText}
                noDataSecondaryText={props.noDataSecondaryText}
                noDataIcon={props.noDataIcon}
            />
        </SidebarContainer>
    );
};