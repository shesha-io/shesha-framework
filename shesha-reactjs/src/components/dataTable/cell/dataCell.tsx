import BooleanCell from './default/booleanCell';
import DateCell from './default/dateCell';
import DateTimeCell from './default/dateTimeCell';
import EntityCell from './default/entityCell';
import NumberCell from './default/numberCell';
import React, { FC, useRef } from 'react';
import StringCell from './default/stringCell';
import TimeCell from './default/timeCell';
import { CustomErrorBoundary } from '@/components';
import { DEFAULT_FORM_SETTINGS, useForm } from '@/providers';
import { getActualModel, upgradeComponent, useAvailableConstantsData } from '@/providers/form/utils';
import { getInjectables } from './utils';
import { IColumnEditorProps, standardCellComponentTypes } from '@/providers/datatableColumnsConfigurator/models';
import { IComponentWrapperProps, IConfigurableCellProps, IDataCellProps } from './interfaces';
import { ITableDataColumn } from '@/providers/dataTable/interfaces';
import { MultivalueReferenceListCell } from './default/multivalueReferenceListCell';
import { ReferenceListCell } from './default/referenceListCell';
import { useCrud } from '@/providers/crudContext';
import { useDeepCompareMemo } from '@/hooks';
import { useFormDesignerComponents } from '@/providers/form/hooks';

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

const ComponentWrapper: FC<IComponentWrapperProps> = (props) => {
  const { columnConfig, propertyMeta, customComponent } = props;

  const toolboxComponents = useFormDesignerComponents();
  const allData = useAvailableConstantsData();

  const component = toolboxComponents[customComponent.type];
  const injectables = getInjectables(props);

  const componentModel = useDeepCompareMemo(() => {
    // migrate component
    const model = upgradeComponent(
      customComponent.settings,
      component,
      DEFAULT_FORM_SETTINGS,
      { allComponents: { 'component': customComponent.settings }, componentRelations: {} }
    );

    // calcualte JS properties
    const actualModel = getActualModel(
      model,
      {
        ...allData,
        formMode: props.readOnly ? 'readonly' : undefined, // imitate form mode according to cell mode
        tableRow: injectables.injectedTableRow
      },
      props.readOnly);

    let editorModel: IColumnEditorProps = {
      ...actualModel,
      ...injectables,
      id: props.columnConfig.columnId,
      type: customComponent.type,
      propertyName: columnConfig.propertyName,
      label: null,
      hideLabel: true,
      readOnly: actualModel.readOnly === undefined ? props.readOnly : actualModel.readOnly,
    };

    if (component.linkToModelMetadata && propertyMeta) {
      editorModel = component.linkToModelMetadata(editorModel, propertyMeta);
    }

    return editorModel;
  }, [customComponent.settings, allData.contexts.lastUpdate, allData.data, allData.formMode, allData.globalState, allData.selectedRow, propertyMeta, injectables]);

  const componentRef = useRef();

  if (!component) {
    return <div>Component not found</div>;
  }

  return (
    <CustomErrorBoundary>
      <component.Factory
        model={componentModel}
        componentRef={componentRef}
        form={allData.form?.form}
      />
    </CustomErrorBoundary>
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
      readOnly={true}
    />
  );
};

const UpdateDataCell = <D extends object = {}, V = number>(props: IDataCellProps<D, V>) => {
  const { columnConfig, propertyMeta, value } = props;
  const customComponent = columnConfig?.editComponent;
  const componentType = customComponent?.type ?? standardCellComponentTypes.notEditable;

  if (componentType === standardCellComponentTypes.notEditable) return <DefaultDataDisplayCell {...props} />;

  return (
    <ComponentWrapper
      propertyMeta={propertyMeta}
      columnConfig={columnConfig}
      customComponent={customComponent}
      defaultValue={value}
    />
  );
};

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

export default DataCell;
