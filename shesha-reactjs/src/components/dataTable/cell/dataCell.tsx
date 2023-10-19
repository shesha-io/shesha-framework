import React, { FC, useMemo, useRef } from 'react';
import { CustomErrorBoundary } from '../../../components';
import { IPropertyMetadata } from '../../../interfaces/metadata';
import { useForm } from '../../../providers';
import { useCrud } from '../../../providers/crudContext';
import { ITableDataColumn } from '../../../providers/dataTable/interfaces';
import {
  IColumnEditorProps,
  IFieldComponentProps,
  standardCellComponentTypes,
} from '../../../providers/datatableColumnsConfigurator/models';
import { useFormDesignerComponents } from '../../../providers/form/hooks';
import BooleanCell from './default/booleanCell';
import DateCell from './default/dateCell';
import DateTimeCell from './default/dateTimeCell';
import EntityCell from './default/entityCell';
import MultivalueReferenceListCell from './default/multivalueReferenceListCell';
import NumberCell from './default/numberCell';
import ReferenceListCell from './default/referenceListCell';
import StringCell from './default/stringCell';
import TimeCell from './default/timeCell';
import { IConfigurableCellProps, IDataCellProps } from './interfaces';
import { getActualModel, useApplicationContext } from 'utils/publicUtils';
import { useDeepCompareMemo } from 'hooks';

export const DataCell = <D extends object = {}, V = number>(props: IDataCellProps<D, V>) => {
    const { mode } = useCrud();

    switch (mode) {
    case 'create':
      return <CreateDataCell {...props} />;
    case 'read':
      return <ReadDataCell {...props} />;
    case 'update':
      return <UpdateDataCell {...props} />;
    default:
      return null;
    }
};

const ReadDataCell = <D extends object = {}, V = number>(props: IDataCellProps<D, V>) => {
    const { columnConfig, propertyMeta } = props;
    const customComponent = columnConfig?.displayComponent;

    const componentType = customComponent?.type ?? standardCellComponentTypes.defaultDisplay;
  const row = props?.row?.original;

  return componentType === standardCellComponentTypes.defaultDisplay ? (
    <DefaultDataDisplayCell {...props} />
  ) : (
    <ComponentWrapper
            propertyMeta={propertyMeta}
            columnConfig={columnConfig}
            customComponent={customComponent}
      defaultRow={row}
    />
  );
};

export const CreateDataCell = (props: IConfigurableCellProps<ITableDataColumn>) => {
    const { columnConfig, propertyMeta } = props;
    const customComponent = columnConfig?.createComponent;
    const componentType = customComponent?.type ?? standardCellComponentTypes.notEditable;

  return componentType === standardCellComponentTypes.notEditable ? null : (
    <ComponentWrapper propertyMeta={propertyMeta} columnConfig={columnConfig} customComponent={customComponent} />
  );
};

const UpdateDataCell = <D extends object = {}, V = number>(props: IDataCellProps<D, V>) => {
    const { columnConfig, propertyMeta } = props;
    const customComponent = columnConfig?.editComponent;
    const componentType = customComponent?.type ?? standardCellComponentTypes.notEditable;

  if (componentType === standardCellComponentTypes.notEditable) return <DefaultDataDisplayCell {...props} />;

  return <ComponentWrapper propertyMeta={propertyMeta} columnConfig={columnConfig} customComponent={customComponent} />;
};

export const DefaultDataDisplayCell = <D extends object = {}, V = number>(props: IDataCellProps<D, V>) => {
    const { columnConfig } = props;
    const { form } = useForm();
    const value = form.getFieldValue(columnConfig.propertyName?.split('.'));
    const cellProps = { ...props, value };

    switch (columnConfig.dataType) {
    case 'number':
      return <NumberCell<D, V> {...cellProps} />;
    case 'date':
      return <DateCell<D, V> {...cellProps} />;
    case 'date-time':
      return <DateTimeCell<D, V> {...cellProps} />;
    case 'time':
      return <TimeCell<D, V> {...cellProps} />;
    case 'reference-list-item':
      return <ReferenceListCell<D, V> {...cellProps} />;
    case 'boolean':
      return <BooleanCell<D, V> {...cellProps} />;
    case 'entity':
      return <EntityCell<D, V> {...cellProps} />;
        case 'array': {
      return columnConfig.dataFormat === 'reference-list-item' ? (
        <MultivalueReferenceListCell<D, V> {...cellProps} />
      ) : (
        <StringCell<D, V> {...props} />
      );
        }
    case 'string':
      return <StringCell<D, V> {...cellProps} />;
    default:
      return <StringCell<D, V> {...cellProps} />;
  }
    };

interface IComponentWrapperProps {
    customComponent: IFieldComponentProps;
    columnConfig: ITableDataColumn;
    propertyMeta?: IPropertyMetadata;
  defaultRow?: { [key in string]?: any };
}

const ComponentWrapper: FC<IComponentWrapperProps> = (props) => {
  const { columnConfig, propertyMeta, customComponent, defaultRow } = props;

    const toolboxComponents = useFormDesignerComponents();
    const allData = useApplicationContext();

    const component = toolboxComponents[customComponent.type];
  const injectables = defaultRow ? { injectedTableRow: defaultRow } : {};

    const componentModel = useMemo(() => {
        const actualModel = useDeepCompareMemo(() => getActualModel(model, allData),
          [allData.contexts.lastUpdate, allData.data, allData.formMode, allData.globalState, allData.selectedRow]);
    
        let model: IColumnEditorProps = {
            ...actualModel,
            ...injectables,
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
            {component.factory(componentModel, componentRef, allData.form)}
        </CustomErrorBoundary>
    );
};

export default DataCell;
