import { LayoutOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useDeepCompareEffect } from 'react-use';
import { IToolboxComponent } from '../../../../interfaces';
import { MetadataProvider, useDataTableStore, useForm, useGlobalState } from '../../../../providers';
import { useDataSource } from '../../../../providers/dataSourcesProvider';
import DataTableProvider from '../../../../providers/dataTable';
import { evaluateDynamicFilters } from '../../../../providers/dataTable/utils';
import { DataTableSelectionProvider, useDataTableSelection } from '../../../../providers/dataTableSelection';
import { FormMarkup } from '../../../../providers/form/models';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import DataSourceSettings from './dataSourceSettings';
import { IDataSourceComponentProps } from './models';
import settingsFormJson from './settingsForm.json';

const settingsForm = settingsFormJson as FormMarkup;

const getPageSize = (value?: number) => { 
  return Boolean(value) ? value : 1147489646 /* get all data */; 
};

const DataSourceComponent: IToolboxComponent<IDataSourceComponentProps> = {
  type: 'dataSource',
  name: 'DataSource',
  icon: <LayoutOutlined />,
  factory: (model: IDataSourceComponentProps) => {
    return <DataSource {...model} />;
  },
  migrator: m => m.add<IDataSourceComponentProps>(0, prev => {
    return {
      ...prev,
      name: prev['uniqueStateId'] ?? prev.name,
      sourceType: 'Entity'
    };
  }),
  settingsFormFactory: ({ readOnly, model, onSave, onCancel, onValuesChange }) => {
    return (
      <DataSourceSettings
        readOnly={readOnly}
        model={model as IDataSourceComponentProps}
        onSave={onSave}
        onCancel={onCancel}
        onValuesChange={onValuesChange}
      />
    );
  },
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export const DataSource: FC<IDataSourceComponentProps> = props => {
  /*const [ provider, setProvider ] = useState(<></>);
  const { entityType } = props;

  useEffect(() => {
    const uniqueKey = `${props.sourceType}_${props.name}_${props.entityType ?? 'empty'}`; // is used just for re-rendering
    setProvider(<DataSourceInner key={uniqueKey} {...props} />);
  }, [props]);*/

  const uniqueKey = `${props.sourceType}_${props.name}_${props.entityType ?? props.endpoint}`; // is used just for re-rendering
  const provider = <DataSourceInner key={uniqueKey} {...props} />;

  return props.entityType ? (
    <MetadataProvider id={props.id} modelType={props.entityType}>
      {provider}
    </MetadataProvider>
  ) : (
    provider
  );
};

export const DataSourceInner: FC<IDataSourceComponentProps> = props => {
  const { sourceType, entityType, endpoint, label, id, name } = props;
  const { formMode } = useForm();
  const [selectedRow, setSelectedRow] = useState(-1);
  const isDesignMode = formMode === 'designer';

  const onSelectRow = index => {
    setSelectedRow(index);
  };

  const provider = useMemo(() => {
    return (
      <DataTableProvider
        userConfigId={id}
        entityType={entityType}
        getDataPath={endpoint}
        title={label}
        selectedRow={selectedRow}
        onSelectRow={onSelectRow}
        actionOwnerId={id}
        actionOwnerName={name}
        sourceType={sourceType}
        initialPageSize={getPageSize(props.maxResultCount)}
      >
        <DataSourceAccessor {...props} />
      </DataTableProvider>);
  }, [props]);

  const providerWrapper = useMemo(() => {
    return sourceType === 'Form'
      ? <FormItem name={props.name}>
          {provider}
        </FormItem>
      : provider;
  }, [sourceType]);

  if (isDesignMode && ((sourceType === 'Entity' && !entityType) || (sourceType === 'Url' && !endpoint)))
    return (
      <Alert
        className="sha-designer-warning"
        message="DataSource is not configured"
        description={sourceType === 'Entity' ? "Select entity type on the settings panel" : "Select endpoint on the settings panel"}
        type="warning"
        showIcon
      />
    );

  return (
    <DataTableSelectionProvider>
      {providerWrapper}
    </DataTableSelectionProvider>
  );
};

const DataSourceAccessor: FC<IDataSourceComponentProps> = ({ id, name, filters, maxResultCount }) => {
  const { registerActions, formData, formMode } = useForm();
  const dataSource = useDataTableStore();
  const { 
    refreshTable, 
    tableConfigLoaded, 
    setPredefinedFilters,
    changePageSize
  } = dataSource;

  const dataSelection = useDataTableSelection();
  //const { selectedRow } = dataSelection;
  const { globalState } = useGlobalState();

  const isDesignMode = formMode === 'designer';

  useEffect(() => {
    changePageSize(getPageSize(maxResultCount));
  }, [maxResultCount]);

  useDataSource({ id, name, dataSource, dataSelection }, [id, name, dataSource, dataSelection]);

  /*const deleteRow = () => {
    console.log(`deleteRow ${selectedRow.id}`);
  };*/

  const debounceEvaluateDynamicFiltersHelper = () => {
    //const data = Boolean(formData) ? camelCaseKeys(formData, { deep: true, pascalCase: true }) : formData;

    const evaluatedFilters = evaluateDynamicFilters(filters, [
      {
        match: 'data',
        data: formData,
      },
      {
        match: 'globalState',
        data: globalState,
      },
    ]);

    setPredefinedFilters(evaluatedFilters);
  };

  useDeepCompareEffect(() => {
      debounceEvaluateDynamicFiltersHelper();
  }, [filters, formData, globalState]);

  // register available actions, refresh on every table configuration loading or change of the table Id
  useEffect(
    () =>
      registerActions(id, {
        refresh: refreshTable,
        //deleteRow,
      }),
    [tableConfigLoaded, id]
  );

  if (!isDesignMode)
      return null;

  return (
    <>
      DataSource: {name}
    </>
  );
};

export default DataSourceComponent;
