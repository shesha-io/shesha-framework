import DataTableProvider from '@/providers/dataTable';
import FormItem from 'antd/lib/form/FormItem';
import React, { FC, useEffect, useMemo } from 'react';
import { evaluateDynamicFilters } from '@/utils';
import { IDataSourceComponentProps } from './models';
import {
  MetadataProvider,
  useDataContextManager,
  useDataTableStore,
  useForm,
  useGlobalState,
  useNestedPropertyMetadatAccessor
} from '@/providers';
import { useDataSource } from '@/providers/dataSourcesProvider';
import { useDeepCompareEffect } from 'react-use';
import ConfigError from '@/components/configError';

const getPageSize = (value?: number) => {
  return Boolean(value) ? value : 1147489646 /* get all data */;
};

const DataSourceAccessor: FC<IDataSourceComponentProps> = ({ id, propertyName: name, filters, maxResultCount }) => {
  const { formData, formMode } = useForm();
  const dataSource = useDataTableStore();
  const {
    setPredefinedFilters,
    changePageSize,
    modelType,
  } = dataSource;

  const { globalState } = useGlobalState();
  const pageContext = useDataContextManager(false)?.getPageContext();

  const isDesignMode = formMode === 'designer';

  useEffect(() => {
    changePageSize(getPageSize(maxResultCount));
  }, [maxResultCount]);

  useDataSource({ id, name, dataSource }, [id, name, dataSource]);

  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(modelType);

  const debounceEvaluateDynamicFiltersHelper = () => {
    evaluateDynamicFilters(
      filters,
      [
        { match: 'data', data: formData },
        { match: 'globalState', data: globalState },
        { match: 'pageContext', data: { ...pageContext.getFull() } ?? {} },
      ],
      propertyMetadataAccessor
    ).then(evaluatedFilters => {
      setPredefinedFilters(evaluatedFilters);
    });
  };

  useDeepCompareEffect(() => {
    debounceEvaluateDynamicFiltersHelper();
  }, [filters, formData, globalState]);

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
      <ConfigError type="DataSource" errorMessage="Entity type or endpoint is not configured" comoponentId={id} />
    );

  return providerWrapper;
};

export const DataSource: FC<IDataSourceComponentProps> = props => {
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
