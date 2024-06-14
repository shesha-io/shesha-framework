import React, {
    FC,
    Fragment,
    useEffect,
    useRef,
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
    useDataTableStore,
    useForm,
    useFormData,
    useGlobalState,
    useSheshaApplication,
} from '@/providers';
import { GlobalTableStyles, useStyles } from './styles/styles';
import { Alert, Button, Tag } from 'antd';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const NotConfiguredWarning: FC = () => {
    return <Alert className="sha-designer-warning" message="Table is not configured properly" type="warning" />;
};


export const TableWrapper: FC<ITableComponentProps> = (props) => {
    const { id, items, useMultiselect, tableStyle, containerStyle } = props;

    const { formMode } = useForm();
    const { data: formData } = useFormData();
    const { globalState } = useGlobalState();
    const { anyOfPermissionsGranted } = useSheshaApplication();
    const { styles } = useStyles();
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
        totalRows,
    } = useDataTableStore();

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

    const filtersRef = useRef(null);
    const scrollbarLeftArrow = useRef(null);
    const scrollbarRightArrow = useRef(null);

    const manageArrows = () => {
        if (!filtersRef.current) return;

        const maxScrollDistance = filtersRef.current.scrollWidth - filtersRef.current.clientWidth - 30;

        if (filtersRef.current.scrollLeft <= 0) {
            scrollbarLeftArrow.current.classList.add("hidden");
        } else {
            scrollbarLeftArrow.current.classList.remove("hidden");
        }

        if (filtersRef.current.scrollLeft > maxScrollDistance + 24) {
            scrollbarRightArrow.current.classList.add("hidden");
        } else {
            scrollbarRightArrow.current.classList.remove("hidden");
        }

        if (filtersRef.current.scrollWidth <= filtersRef.current.clientWidth) {
            scrollbarRightArrow.current.classList.remove("active");
            scrollbarLeftArrow.current.classList.remove("active");
        }
    };

    const scrollRight = () => {
        if (filtersRef.current) {
            filtersRef.current.scrollLeft += 100;
            manageArrows();
        }
    };

    const scrollLeft = () => {
        if (filtersRef.current) {
            manageArrows();
            filtersRef.current.scrollLeft -= filtersRef.current.scrollLeft === 0 ? 200 : 100;
        }
    };

    useEffect(() => {
        manageArrows();

        const handleScroll = () => {
            manageArrows();
        };

        if (filtersRef.current) {
            manageArrows();
            filtersRef.current.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (filtersRef.current) {
                filtersRef.current.removeEventListener('scroll', handleScroll);
            }
        };
    }, [filtersRef.current]);

    const FiltersList = ({ filters, clearFilters }) => {
        return (
            <div style={{ textAlign: "center" }}>
                <div className={styles.scrollableTagsContainer}>
                    <LeftOutlined
                        ref={scrollbarLeftArrow}
                        className={styles.arrowLeft}
                        onClick={scrollLeft}
                    />
                    <div className="filters" ref={filtersRef}>
                        {filters?.map(({ columnId }) => {
                            return (
                                <Tag
                                    bordered={false}
                                    closable
                                    key={columnId}
                                    onClose={() => removeColumnFilter(columnId)}
                                    className={styles.tag}
                                >
                                    {columnId}
                                </Tag>
                            );
                        })}
                    </div>
                    <RightOutlined
                        ref={scrollbarRightArrow}
                        className={styles.arrowRight}
                        onClick={scrollRight}
                    />
                </div>
                {`Filters( ${totalRows} results): `}
                <Button
                    onClick={clearFilters}
                    style={{
                        fontSize: 12,
                        color: styles.secondaryColor,
                        fontWeight: 500,
                    }}
                >
                    clear all
                </Button>
            </div>
        );
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
            {tableFilter?.length > 0 && <FiltersList filters={tableFilter} clearFilters={clearFilters} />}
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