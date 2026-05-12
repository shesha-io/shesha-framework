import BooleanCell from './default/booleanCell';
import DateCell from './default/dateCell';
import DateTimeCell from './default/dateTimeCell';
import EntityCell from './default/entityCell';
import NumberCell from './default/numberCell';
import React, { FC, ReactNode, useMemo } from 'react';
import StringCell from './default/stringCell';
import TimeCell from './default/timeCell';
import { CustomErrorBoundary } from '@/components/customErrorBoundary';
import { DEFAULT_FORM_SETTINGS, FormItemProvider, IConfigurableFormComponent, useForm } from '@/providers';
import { upgradeComponent } from '@/providers/form/utils';
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
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { getNumberOrUndefined } from '@/utils/string';
import { IPropertyMetadata, IToolboxComponent } from '@/interfaces';

export const DefaultDataDisplayCell = <D extends object = object, V = unknown>(props: IDataCellProps<D, V>): ReactNode => {
  const { columnConfig } = props;
  const { form } = useForm();
  const value = !isNullOrWhiteSpace(columnConfig.propertyName) && isDefined(form)
    ? form.getFieldValue(columnConfig.propertyName.split('.')) as unknown
    : undefined;

  switch (columnConfig.dataType) {
    case 'number':
      const numericValue = getNumberOrUndefined(value);
      return <NumberCell<D> {...props} value={numericValue} />;
    case 'date':
      return <DateCell<D> {...props} value={value} />;
    case 'date-time':
      return <DateTimeCell<D> {...props} value={value} />;
    case 'time':
      return <TimeCell<D> {...props} value={value} />;
    case 'reference-list-item':
      return <ReferenceListCell<D> {...props} value={value} />;
    case 'boolean':
      return <BooleanCell<D> {...props} value={value} />;
    case 'entity':
      return <EntityCell<D> {...props} value={value} />;
    case 'array': {
      switch (columnConfig.dataFormat) {
        case 'reference-list-item':
        case 'multivalue-reference-list':
          return <MultivalueReferenceListCell<D> {...props} value={value} />;
        case 'entity':
          return <MultiEntityCell<D> {...props} value={value} />;
        default:
          return <StringCell<D> {...props} value={value} />;
      }
    }
    case 'string':
      return <StringCell<D> {...props} value={value} />;
    default:
      return <StringCell<D> {...props} value={value} />;
  }
};

type ComponentWrapperInnerProps = {
  component: IToolboxComponent;
  model: IConfigurableFormComponent;
  columnId: string;
  propertyName: string;
  readOnly?: boolean | undefined;
  propertyMeta?: IPropertyMetadata | undefined;
  tableRow?: { [key in string]?: unknown } | undefined;
};

const ComponentWrapperInner: FC<ComponentWrapperInnerProps> = (props) => {
  const { component, model, columnId, propertyName, readOnly, propertyMeta, tableRow } = props;
  const { styles, cx } = useStyles();

  const actualModel = useActualContextData(
    model, readOnly ? true : undefined,
    {
      tableRow: tableRow,
    },
  );

  const componentModel: IConfigurableFormComponent = useDeepCompareMemo(() => {
    // migrate component
    let editorModel: IColumnEditorProps = {
      ...actualModel,
      id: columnId,
      type: model.type,
      propertyName: propertyName,
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
  }, [actualModel, propertyMeta, props.readOnly]);

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

const ComponentWrapper: FC<IComponentWrapperProps> = React.memo((props) => {
  const { columnConfig, propertyMeta, customComponent, defaultRow } = props;

  const toolboxComponents = useFormDesignerComponents();

  const component = toolboxComponents[customComponent.type];

  const model = useMemo<IConfigurableFormComponent | undefined>(() => {
    return customComponent.settings && component
      ? upgradeComponent(
        customComponent.settings,
        component,
        DEFAULT_FORM_SETTINGS,
        { allComponents: { component: customComponent.settings }, componentRelations: {} },
      )
      : undefined;
  }, [customComponent.settings, component]);

  return component && model && !isNullOrWhiteSpace(columnConfig.columnId) && !isNullOrWhiteSpace(columnConfig.propertyName)
    ? (
      <ComponentWrapperInner
        component={component}
        model={model}
        columnId={columnConfig.columnId}
        propertyName={columnConfig.propertyName}
        propertyMeta={propertyMeta}
        tableRow={defaultRow}
      />
    )
    : <div>Component not found</div>;
});

ComponentWrapper.displayName = 'ComponentWrapper';

export const CreateDataCell = (props: IConfigurableCellProps<ITableDataColumn>): ReactNode => {
  const { columnConfig, propertyMeta } = props;
  const customComponent = columnConfig.createComponent;
  const componentType = customComponent?.type ?? standardCellComponentTypes.notEditable;

  return isDefined(customComponent) && componentType !== standardCellComponentTypes.notEditable
    ? (
      <ComponentWrapper propertyMeta={propertyMeta} columnConfig={columnConfig} customComponent={customComponent} />
    )
    : undefined;
};

const ReadDataCell = <D extends object = object, V = number>(props: IDataCellProps<D, V>): ReactNode => {
  const { columnConfig, propertyMeta, row } = props;
  const customComponent = columnConfig.displayComponent;

  return isDefined(customComponent) && customComponent.type !== standardCellComponentTypes.defaultDisplay
    ? (
      <ComponentWrapper
        propertyMeta={propertyMeta}
        columnConfig={columnConfig}
        customComponent={customComponent}
        defaultRow={row.original}
        readOnly={true}
      />
    )
    : <DefaultDataDisplayCell {...props} />;
};

const UpdateDataCell = <D extends object = object, V = number>(props: IDataCellProps<D, V>): React.JSX.Element => {
  const { columnConfig, propertyMeta, value } = props;
  const customComponent = columnConfig.editComponent;

  return isDefined(customComponent) && customComponent.type !== standardCellComponentTypes.notEditable
    ? (
      <ComponentWrapper
        propertyMeta={propertyMeta}
        columnConfig={columnConfig}
        customComponent={customComponent}
        defaultValue={value}
      />
    )
    : <DefaultDataDisplayCell {...props} />;
};

export const DataCell = <D extends object = object, V = unknown>(props: IDataCellProps<D, V>): ReactNode => {
  const { mode } = useCrud();

  switch (mode) {
    case 'create':
      return <CreateDataCell {...props} />;
    case 'read':
      return <ReadDataCell {...props} />;
    case 'update':
      return <UpdateDataCell {...props} />;
    default:
      return undefined;
  }
};

export default DataCell;
