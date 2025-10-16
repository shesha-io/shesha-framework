import BooleanCell from './default/booleanCell';
import DateCell from './default/dateCell';
import DateTimeCell from './default/dateTimeCell';
import EntityCell from './default/entityCell';
import NumberCell from './default/numberCell';
import React, { FC, useMemo } from 'react';
import StringCell from './default/stringCell';
import TimeCell from './default/timeCell';
import { CustomErrorBoundary } from '@/components';
import { DEFAULT_FORM_SETTINGS, FormItemProvider, IConfigurableFormComponent, useForm } from '@/providers';
import { upgradeComponent } from '@/providers/form/utils';
import { getInjectables } from './utils';
import { IColumnEditorProps, standardCellComponentTypes } from '@/providers/datatableColumnsConfigurator/models';
import { IComponentWrapperProps, IConfigurableCellProps, IDataCellProps } from './interfaces';
import { ITableDataColumn } from '@/providers/dataTable/interfaces';
import { MultivalueReferenceListCell } from './default/multivalueReferenceListCell';
import { ReferenceListCell } from './default/referenceListCell';
import { useCrud } from '@/providers/crudContext';
import { useActualContextData, useDeepCompareMemo } from '@/hooks';
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { updateModelExcludeFiltered } from '@/components/formComponentSelector/adapters';
import { getEditorAdapter } from '@/components/formComponentSelector';
import MultiEntityCell from './default/multiEntityCell';
import FormComponentMemo from '@/components/formDesigner/formComponent';
import { useStyles } from '../styles/styles';

export const DefaultDataDisplayCell = <D extends object = object, V = number>(props: IDataCellProps<D, V>): JSX.Element => {
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
      switch (columnConfig.dataFormat) {
        case 'reference-list-item':
          return <MultivalueReferenceListCell<D, V> {...cellProps} />;
        case 'entity':
          return <MultiEntityCell<D, V> {...cellProps} />;
        default:
          return <StringCell<D, V> {...cellProps} />;
      }
    }
    case 'string':
      return <StringCell<D, V> {...cellProps} />;
    default:
      return <StringCell<D, V> {...cellProps} />;
  }
};

const ComponentWrapper: FC<IComponentWrapperProps> = (props) => {
  const { columnConfig, propertyMeta, customComponent } = props;
  const { styles, cx } = useStyles();

  const toolboxComponents = useFormDesignerComponents();

  const component = toolboxComponents[customComponent.type];
  const injectables = getInjectables(props);

  const model = useMemo(() => upgradeComponent(
    customComponent.settings,
    component,
    DEFAULT_FORM_SETTINGS,
    { allComponents: { component: customComponent.settings }, componentRelations: {} },
  ), [customComponent.settings]);

  const actualModel = useActualContextData(
    model, props.readOnly ? true : undefined,
    {
      tableRow: injectables.injectedTableRow,
    },
  );

  const componentModel: IConfigurableFormComponent = useDeepCompareMemo(() => {
    // migrate component
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

    const adapter = getEditorAdapter(component);

    if (component.linkToModelMetadata && propertyMeta && adapter?.propertiesFilter) {
      editorModel = updateModelExcludeFiltered(editorModel, component.linkToModelMetadata({
        type: editorModel.type,
        id: editorModel.id,
      }, propertyMeta), adapter.propertiesFilter);
    }

    return editorModel;
  }, [actualModel, columnConfig, propertyMeta, injectables]);

  if (!component) {
    return <div>Component not found</div>;
  }

  return (
    <CustomErrorBoundary>
      {/* set namePrefix = '' to reset subForm prefix */}
      <FormItemProvider namePrefix="">
        <div className={cx(styles.shaDataCell, styles.shaSpanCenterVertically)}>
          <FormComponentMemo componentModel={componentModel} />
        </div>
      </FormItemProvider>
    </CustomErrorBoundary>
  );
};

export const CreateDataCell = (props: IConfigurableCellProps<ITableDataColumn>): JSX.Element => {
  const { columnConfig, propertyMeta } = props;
  const customComponent = columnConfig?.createComponent;
  const componentType = customComponent?.type ?? standardCellComponentTypes.notEditable;

  return componentType === standardCellComponentTypes.notEditable ? null : (
    <ComponentWrapper propertyMeta={propertyMeta} columnConfig={columnConfig} customComponent={customComponent} />
  );
};

const ReadDataCell = <D extends object = object, V = number>(props: IDataCellProps<D, V>): JSX.Element => {
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

const UpdateDataCell = <D extends object = object, V = number>(props: IDataCellProps<D, V>): JSX.Element => {
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

export const DataCell = <D extends object = object, V = number>(props: IDataCellProps<D, V>): JSX.Element => {
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
