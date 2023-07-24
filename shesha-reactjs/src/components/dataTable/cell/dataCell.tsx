import React, { FC, useMemo, useRef } from 'react';
import { IConfigurableCellProps, IDataCellProps } from './interfaces';
import BooleanCell from "./default/booleanCell";
import DateCell from "./default/dateCell";
import DateTimeCell from "./default/dateTimeCell";
import EntityCell from "./default/entityCell";
import MultivalueReferenceListCell from "./default/multivalueReferenceListCell";
import NumberCell from "./default/numberCell";
import ReferenceListCell from "./default/referenceListCell";
import StringCell from "./default/stringCell";
import TimeCell from "./default/timeCell";
import { useCrud } from 'providers/crudContext';
import { CustomErrorBoundary } from 'components';
import { useFormDesignerComponents } from 'providers/form/hooks';
import { useForm } from 'providers';
import { IColumnEditorProps, IFieldComponentProps, standardCellComponentTypes } from 'providers/datatableColumnsConfigurator/models';
import { IPropertyMetadata } from 'interfaces/metadata';
import { ITableDataColumn } from 'providers/dataTable/interfaces';

export const DataCell = <D extends object = {}, V = number>(props: IDataCellProps<D, V>) => {
    const { mode } = useCrud();

    switch (mode) {
        case 'create': return <CreateDataCell {...props} />;
        case 'read': return <ReadDataCell {...props} />;
        case 'update': return <UpdateDataCell {...props} />;
    }
    return null;
};

const ReadDataCell = <D extends object = {}, V = number>(props: IDataCellProps<D, V>) => {
    const { columnConfig, propertyMeta } = props;
    const customComponent = columnConfig?.displayComponent;

    const componentType = customComponent?.type ?? standardCellComponentTypes.defaultDisplay;

    return componentType === standardCellComponentTypes.defaultDisplay
        ? <DefaultDataDisplayCell {...props} />
        : <ComponentWrapper
            propertyMeta={propertyMeta}
            columnConfig={columnConfig}
            customComponent={customComponent}
        />;
};

export const CreateDataCell = (props: IConfigurableCellProps<ITableDataColumn>) => {
    const { columnConfig, propertyMeta } = props;
    const customComponent = columnConfig?.createComponent;
    const componentType = customComponent?.type ?? standardCellComponentTypes.notEditable;

    return componentType === standardCellComponentTypes.notEditable
        ? null
        : <ComponentWrapper
            propertyMeta={propertyMeta}
            columnConfig={columnConfig}
            customComponent={customComponent}
        />;
};

const UpdateDataCell = <D extends object = {}, V = number>(props: IDataCellProps<D, V>) => {
    const { columnConfig, propertyMeta } = props;
    const customComponent = columnConfig?.editComponent;
    const componentType = customComponent?.type ?? standardCellComponentTypes.notEditable;

    if (componentType === standardCellComponentTypes.notEditable)
        return <DefaultDataDisplayCell {...props} />;

    return (
        <ComponentWrapper
            propertyMeta={propertyMeta}
            columnConfig={columnConfig}
            customComponent={customComponent}
        />
    );
};

const DefaultDataDisplayCell = <D extends object = {}, V = number>(props: IDataCellProps<D, V>) => {
    const { columnConfig } = props;
    const { form } = useForm();
    const value = form.getFieldValue(columnConfig.propertyName);
    const cellProps = { ...props, value };

    switch (columnConfig.dataType) {
        case 'number': return (<NumberCell<D, V> {...cellProps} />);
        case 'date': return (<DateCell<D, V> {...cellProps} />);
        case 'date-time': return (<DateTimeCell<D, V> {...cellProps} />);
        case 'time': return (<TimeCell<D, V> {...cellProps} />);
        case 'reference-list-item': return (<ReferenceListCell<D, V> {...cellProps} />);
        case 'boolean': return (<BooleanCell<D, V> {...cellProps} />);
        case 'entity': return (<EntityCell<D, V> {...cellProps} />);
        case 'array': {
            return columnConfig.dataFormat === 'reference-list-item'
                ? <MultivalueReferenceListCell<D, V> {...cellProps} />
                : <StringCell<D, V> {...props} />;
        }
        case 'string': return <StringCell<D, V> {...cellProps} />;
        default: return <StringCell<D, V> {...cellProps} />;
    };
};

interface IComponentWrapperProps {
    customComponent: IFieldComponentProps;
    columnConfig: ITableDataColumn;
    propertyMeta?: IPropertyMetadata;
};

const ComponentWrapper: FC<IComponentWrapperProps> = (props) => {
    const { columnConfig, propertyMeta, customComponent } = props;

    const toolboxComponents = useFormDesignerComponents();
    const { form } = useForm();

    const component = toolboxComponents[customComponent.type];

    const componentModel = useMemo(() => {
        let model: IColumnEditorProps = {
            ...customComponent.settings,
            id: props.columnConfig.columnId,
            type: customComponent.type,
            propertyName: columnConfig.propertyName,
            label: null,
            hideLabel: true,
        };

        if (component.linkToModelMetadata && propertyMeta) {
            model = component.linkToModelMetadata(model, propertyMeta);
        }

        return model;
    }, []);

    const componentRef = useRef();

    if (!component) {
        return <div>Component not found</div>;
    }

    return (
        <CustomErrorBoundary>
            {component.factory(componentModel, componentRef, form)}
        </CustomErrorBoundary>
    );
};

export default DataCell;