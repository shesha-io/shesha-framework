import { LayoutOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import React, { FC, Fragment, useEffect, useMemo } from 'react';
import ComponentsContainer from 'components/formDesigner/containers/componentsContainer';
import { IToolboxComponent, YesNoInherit } from 'interfaces';
import { useDataTableStore, useForm, useFormData } from 'providers';
import DataTableProvider from 'providers/dataTable';
import { FormMarkup, IConfigurableFormComponent } from 'providers/form/models';
import { evaluateString, validateConfigurableComponentSettings } from 'providers/form/utils';
import settingsFormJson from './settingsForm.json';
import { ColumnSorting, DataFetchingMode, GroupingItem, ISortingItem, SortMode } from 'providers/dataTable/interfaces';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';
import { ConfigurableFormItem } from 'components';
import { evaluateYesNo } from 'utils/form';

export interface ITableContextComponentProps extends IConfigurableFormComponent {
  sourceType?: 'Form' | 'Entity' | 'Url';
  entityType?: string;
  endpoint?: string;
  components?: IConfigurableFormComponent[]; // If isDynamic we wanna
  dataFetchingMode?: DataFetchingMode;
  defaultPageSize?: number;
  grouping?: GroupingItem[];
  sortMode?: SortMode;
  strictSortBy?: string;
  strictSortOrder?: ColumnSorting;
  standardSorting?: ISortingItem[];
  allowReordering?: YesNoInherit;
}

const settingsForm = settingsFormJson as FormMarkup;

const TableContextComponent: IToolboxComponent<ITableContextComponentProps> = {
  type: 'datatableContext',
  name: 'DataTable Context',
  icon: <LayoutOutlined />,
  Factory: ({ model }) => {
    return <TableContext {...model} />;
  },
  migrator: (m) =>
    m
      .add<ITableContextComponentProps>(0, (prev) => {
        return {
          ...prev,
          name: prev['uniqueStateId'] ?? prev['name'],
        };
      })
      .add<ITableContextComponentProps>(1, (prev) => {
        return {
          ...prev,
          sourceType: 'Entity',
        };
      })
      .add<ITableContextComponentProps>(2, (prev) => {
        return {
          ...prev,
          defaultPageSize: 10,
        };
      })
      .add<ITableContextComponentProps>(3, (prev) => {
        return {
          ...prev,
          dataFetchingMode: 'paging',
        };
      })
      .add<ITableContextComponentProps>(4, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<ITableContextComponentProps>(5, (prev) => ({ ...prev, sortMode: 'standard', strictSortOrder: 'asc', allowReordering: 'no' }))
  ,
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
};

export const TableContext: FC<ITableContextComponentProps> = (props) => {

  const uniqueKey = useMemo(() => {
    return `${props.sourceType}_${props.propertyName}_${props.entityType ?? 'empty'}`; // is used just for re-rendering
  }, [props.sourceType, props.propertyName, props.entityType]);

  return <TableContextInner key={uniqueKey} {...props} />;
};

interface ITableContextInnerProps extends ITableContextComponentProps {
}

export const TableContextInner: FC<ITableContextInnerProps> = (props) => {
  const { sourceType, entityType, endpoint, id, propertyName, componentName, allowReordering } = props;
  const { formMode } = useForm();
  const { data } = useFormData();

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
    >
      <TableContextAccessor {...props} />
    </DataTableProvider>
    ;

  return sourceType === 'Form'
    ? <ConfigurableFormItem model={{ ...props, hideLabel: true }} wrapperCol={{ md: 24 }}>
      {(_v, onChange, _p, getFieldValue) => provider(getFieldValue, onChange)}
    </ConfigurableFormItem>
    : provider();
};

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

export default TableContextComponent;
