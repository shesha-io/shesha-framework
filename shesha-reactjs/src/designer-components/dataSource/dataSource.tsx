import DataTableProvider from '@/providers/dataTable';
import FormItem from 'antd/lib/form/FormItem';
import React, { FC, useEffect, useMemo } from 'react';
import { Alert } from 'antd';
import { evaluateDynamicFilters } from '@/utils';
import { IDataSourceComponentProps } from './models';
import {
  MetadataProvider,
  useDataTableStore,
  useForm,
  useGlobalState,
  useNestedPropertyMetadatAccessor
} from '@/providers';
import { useDataSource } from '@/providers/dataSourcesProvider';
import { useDeepCompareEffect } from 'react-use';

const getPageSize = (value?: number) => {
  return Boolean(value) ? value : 1147489646 /* get all data */;
};

const DataSourceAccessor: FC<IDataSourceComponentProps> = ({ id, propertyName: name, filters, maxResultCount }) => {
  const { registerActions, formData, formMode } = useForm();
  const dataSource = useDataTableStore();
  const {
    refreshTable,
    setPredefinedFilters,
    changePageSize,
    modelType,
  } = dataSource;

  //const { selectedRow } = dataSelection;
  const { globalState } = useGlobalState();

  const isDesignMode = formMode === 'designer';

  useEffect(() => {
    changePageSize(getPageSize(maxResultCount));
  }, [maxResultCount]);

  useDataSource({ id, name, dataSource }, [id, name, dataSource]);

  /*const deleteRow = () => {
    console.log(`deleteRow ${selectedRow?.id}`);
  };*/

  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(modelType);

  const debounceEvaluateDynamicFiltersHelper = () => {
    evaluateDynamicFilters(
      filters,
      [
        { match: 'data', data: formData },
        { match: 'globalState', data: globalState }
      ],
      propertyMetadataAccessor
    ).then(evaluatedFilters => {
      setPredefinedFilters(evaluatedFilters);
    });
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
    [id]
  );

  if (!isDesignMode)
    return null;

  return (
    <>
      DataSource: {name}
    </>
  );
};


export const DataSourceInner: FC<IDataSourceComponentProps> = props => {
  const { sourceType, entityType, endpoint, id, propertyName: name } = props;
  const { formMode } = useForm();
  const isDesignMode = formMode === 'designer';

  const provider = useMemo(() => {
    return (
      <DataTableProvider
        userConfigId={id}
        entityType={entityType}
        getDataPath={endpoint}
        actionOwnerId={id}
        actionOwnerName={name}
        sourceType={sourceType}
        initialPageSize={getPageSize(props.maxResultCount)}
        dataFetchingMode='paging'
      >
        <DataSourceAccessor {...props} />
      </DataTableProvider>);
  }, [props]);

  const providerWrapper = useMemo(() => {
    return sourceType === 'Form'
      ? <FormItem name={props.propertyName}>
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

  return providerWrapper;
};

export const DataSource: FC<IDataSourceComponentProps> = props => {
  /*const [ provider, setProvider ] = useState(<></>);
  const { entityType } = props;

  useEffect(() => {
    const uniqueKey = `${props.sourceType}_${props.name}_${props.entityType ?? 'empty'}`; // is used just for re-rendering
    setProvider(<DataSourceInner key={uniqueKey} {...props} />);
  }, [props]);*/

  const uniqueKey = `${props.sourceType}_${props.propertyName}_${props.entityType ?? props.endpoint}`; // is used just for re-rendering
  const provider = <DataSourceInner key={uniqueKey} {...props} />;

  return props.entityType ? (
    <MetadataProvider id={props.id} modelType={props.entityType}>
      {provider}
    </MetadataProvider>
  ) : (
    provider
  );
};
