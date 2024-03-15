import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import DataTableProvider from '@/providers/dataTable';
import React, {
    FC,
    Fragment,
    useEffect,
    useMemo
} from 'react';
import { Alert } from 'antd';
import { ConfigurableFormItem } from '@/components';
import { evaluateString } from '@/providers/form/utils';
import { evaluateYesNo } from '@/utils/form';
import {
    useDataTableStore,
    useForm,
    useFormData,
    useNestedPropertyMetadatAccessor
} from '@/providers';
import { useFormEvaluatedFilter } from '@/providers/dataTable/filters/evaluateFilter';
import { ITableContextComponentProps } from './models';

interface ITableContextInnerProps extends ITableContextComponentProps {
}

const TableContextAccessor: FC<ITableContextComponentProps> = ({ id }) => {
    const { registerActions } = useForm();
    const { selectedRow, refreshTable, exportToExcel, setIsInProgressFlag } = useDataTableStore();

    const toggleColumnsSelector = () => {
        setIsInProgressFlag({ isSelectingColumns: true, isFiltering: false });
    };

    const toggleAdvancedFilter = () => {
        setIsInProgressFlag({ isFiltering: true, isSelectingColumns: false });
    };

    // register available actions, refresh on every table configuration loading or change of the table Id
    useEffect(
        () =>
            registerActions(id, {
                refresh: refreshTable,
                toggleColumnsSelector,
                toggleAdvancedFilter,
                exportToExcel,
            }),
        [selectedRow]
    );

    return (
        <Fragment>
            <ComponentsContainer containerId={id} />
        </Fragment>
    );
};

export const TableContextInner: FC<ITableContextInnerProps> = (props) => {
    const { sourceType, entityType, endpoint, id, propertyName, componentName, allowReordering } = props;
    const { formMode } = useForm();
    const { data } = useFormData();

    const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(props.entityType);
    const permanentFilter = useFormEvaluatedFilter({ filter: props.permanentFilter, metadataAccessor: propertyMetadataAccessor });

    const isDesignMode = formMode === 'designer';

    const getDataPath = evaluateString(endpoint, { data });

    const configurationWarningMessage = !sourceType
        ? 'Select `Source type` on the settings panel'
        : sourceType === 'Entity' && !entityType
            ? 'Select `Entity Type` on the settings panel'
            : sourceType === 'Url' && !endpoint
                ? 'Select `Custom Endpoint` on the settings panel'
                : sourceType === 'Form' && !propertyName
                    ? 'Select `propertyName` on the settings panel'
                    : null;

    if (isDesignMode && configurationWarningMessage)
        return (
            <Alert
                className="sha-designer-warning"
                message="Table is not configured"
                description={configurationWarningMessage}
                type="warning"
                showIcon
            />
        );

    const provider = (getFieldValue = undefined, onChange = undefined) =>
        <DataTableProvider
            userConfigId={props.id}
            entityType={entityType}
            getDataPath={getDataPath}
            propertyName={propertyName}
            actionOwnerId={id}
            actionOwnerName={componentName}
            sourceType={props.sourceType}
            initialPageSize={props.defaultPageSize ?? 10}
            dataFetchingMode={props.dataFetchingMode ?? 'paging'}
            getFieldValue={getFieldValue}
            onChange={onChange}
            grouping={props.grouping}
            sortMode={props.sortMode}
            strictSortBy={props.strictSortBy}
            strictSortOrder={props.strictSortOrder}
            standardSorting={props.standardSorting}
            allowReordering={evaluateYesNo(allowReordering, formMode)}
            permanentFilter={permanentFilter}
        >
            <TableContextAccessor {...props} />
        </DataTableProvider>
        ;

      if(props?.hidden){
        return null
      }
    return sourceType === 'Form'
        ? <ConfigurableFormItem model={{ ...props, hideLabel: true }} wrapperCol={{ md: 24 }}>
            {(value, onChange) => provider(() => value, onChange)}
        </ConfigurableFormItem>
        : provider();
};

export const TableContext: FC<ITableContextComponentProps> = (props) => {

    const uniqueKey = useMemo(() => {
        return `${props.sourceType}_${props.propertyName}_${props.entityType ?? 'empty'}`; // is used just for re-rendering
    }, [props.sourceType, props.propertyName, props.entityType]);

    return <TableContextInner key={uniqueKey} {...props} />;
};
