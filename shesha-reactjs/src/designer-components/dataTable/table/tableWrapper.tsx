import React, {
    CSSProperties,
    FC,
    Fragment,
} from 'react';
import { filterVisibility } from './utils';
import { getStyle } from '@/providers/form/utils';
import { ITableComponentProps } from './models';
import {
    SidebarContainer,
    DataTable,
    DatatableAdvancedFilter,
    DatatableColumnsSelector,
} from '@/components';
import {
    useDataTable,
    useDataTableStore,
    useForm,
    useFormData,
    useGlobalState,
    useSheshaApplication,
} from '@/providers';
import { GlobalTableStyles } from './styles/styles';
import { Alert } from 'antd';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { FilterList } from '../filterList/filterList';

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
        selectedRow,
        setMultiSelectedRow,
        requireColumns,
        allowReordering,
        clearFilters,
        removeColumnFilter,
        tableFilter,
    } = useDataTableStore();

    const { totalRows } = useDataTable();

    requireColumns(); // our component requires columns loading. it's safe to call on each render

    const repository = getRepository();

    useDeepCompareEffect(() => {
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

    if (isDesignMode && !repository) return <NotConfiguredWarning />;

    const toggleFieldPropertiesSidebar = () => {
        if (!isSelectingColumns && !isFiltering) setIsInProgressFlag({ isFiltering: true });
        else setIsInProgressFlag({ isFiltering: false, isSelectingColumns: false });
    };


    const shadowObject = {
        x: props.boxShadowX || 0,
        y: props.boxShadowY || 0,
        blur: props.boxShadowBlur || '0px',
        spread: props.boxShadowSpread || '0px',
        color: props.boxShadowColor || '#000000',
        inset: props.boxShadowInset || false
    };

    const borderObject = {
        width: props.borderWidth || 0,
        style: props.borderStyle || 'solid',
        color: props.borderColor || '#000000'
    };

    const createBoxShadow = (shadowObj: {
        x: number;
        y: number;
        blur: string;
        spread: string;
        color: string;
        inset: boolean;
    }): string => {
        const { x, y, blur, spread, color, inset } = shadowObj;
        return `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px ${color}`;
    };

    const createBorder = (borderObj: {
        width: number;
        style: CSSProperties['borderStyle'];
        color: string;
      }): string => {
        const { width, style, color } = borderObj;
        return `${width}px ${style} ${color}`;
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
            {tableFilter?.length > 0 && <FilterList filters={tableFilter} rows={totalRows} clearFilters={clearFilters} removeColumnFilter={removeColumnFilter} />}

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
                striped={props.toggleZebraStripes}
                onRowClick={props.onRowClick}
                onRowDblClick={props.onRowDblClick}
                onRowSelect={props.onRowSelect}
                shadowObject={shadowObject}
                renderedShadow={createBoxShadow(shadowObject)}
                renderedBorder={createBorder(borderObject)}
                borderObject={borderObject}
                fontFamily={props.fontFamily}
                tableFontSize={props.tableFontSize}
                headerFontSize={props.headerFontSize}
                headerTextColor={props.headerTextColor}
                headerHeight={props.headerHeight}
                headerBorder={props.headerBorder}
                headerBackgroundColor={props.headerBackgroundColor}
                width={props.width}
                tableHeight={props.tableHeight}
                backgroundColor={props.backgroundColor}
                zebraStripeColor={props.zebraStripeColor}
                hoverHighlight={props.hoverHighlight}
                rowHeight={props.rowHeight}
                rowPadding={props.rowPadding}
                tableFontColor={props.fontColor}
                rowSelectedColor={props.rowSelectedColor}
                overflowX={props.overflowX}
                overflowY={props.overflowY}
                borderRadius={props.borderRadius}
                sortIndicator={props.sortIndicator}
            />
        </SidebarContainer>
    );
};