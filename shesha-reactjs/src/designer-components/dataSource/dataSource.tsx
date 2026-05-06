import DataTableProvider from '@/providers/dataTable';
import FormItem from 'antd/lib/form/FormItem';
import React, { FC, useEffect } from 'react';
import { Alert } from 'antd';
import { evaluateDynamicFilters } from '@/utils/datatable';
import { IDataSourceComponentProps } from './models';
import {
  MetadataProvider,
  useDataContextManagerActionsOrUndefined,
  useDataTableStore,
  useForm,
  useGlobalState,
  useNestedPropertyMetadatAccessor,
} from '@/providers';
import { useDataSource } from '@/providers/dataSourcesProvider';
import { useDeepCompareEffect } from 'react-use';
import { useShaFormDataUpdate } from '@/providers/form/providers/shaFormProvider';
import { getEntityTypeName, isEntityTypeId, isEntityTypeIdEmpty } from '@/providers/metadataDispatcher/entities/utils';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { throwError } from '@/utils/errors';

const getPageSize = (value?: number): number => {
  return isDefined(value) ? value : 1147489646;
};

const DataSourceAccessor: FC<IDataSourceComponentProps> = ({ id, propertyName: name, filters, maxResultCount }) => {
  const { formData, formMode } = useForm();
  const dataSource = useDataTableStore();
  const {
    setPredefinedFilters,
    changePageSize,
    modelType,
  } = dataSource;

  // ToDo: AS - need to optimize
  useShaFormDataUpdate();

  const { globalState } = useGlobalState();
  const pageContext = useDataContextManagerActionsOrUndefined()?.getPageContext();

  const isDesignMode = formMode === 'designer';

  useEffect(() => {
    changePageSize(getPageSize(maxResultCount));
  }, [changePageSize, maxResultCount]);

  useDataSource({ id, name: name ?? "", dataSource });

  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(modelType);

  const debounceEvaluateDynamicFiltersHelper = (): void => {
    evaluateDynamicFilters(
      filters,
      [
        { match: 'data', data: formData },
        { match: 'globalState', data: globalState },
        { match: 'pageContext', data: { ...pageContext?.getFull() } },
      ],
      propertyMetadataAccessor,
    ).then((evaluatedFilters) => {
      setPredefinedFilters(evaluatedFilters);
    }).catch((error) => {
      console.error('Failed to evaluate dynamic filters', error);
      throw error;
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


export const DataSourceInner: FC<IDataSourceComponentProps> = (props) => {
  const { sourceType, entityType, endpoint, id, propertyName: name } = props;
  const { formMode } = useForm();
  const isDesignMode = formMode === 'designer';

  if (isDesignMode && ((sourceType === 'Entity' && isEntityTypeIdEmpty(entityType)) || (sourceType === 'Url' && !endpoint)))
    return (
      <Alert
        className="sha-designer-warning"
        title="DataSource is not configured"
        description={sourceType === 'Entity' ? "Select entity type on the settings panel" : "Select endpoint on the settings panel"}
        type="warning"
        showIcon
      />
    );

  const provider = (
    <DataTableProvider
      userConfigId={id}
      entityType={entityType}
      getDataPath={endpoint}
      actionOwnerId={id}
      actionOwnerName={name}
      sourceType={sourceType}
      initialPageSize={getPageSize(props.maxResultCount)}
      dataFetchingMode="paging"
    >
      <DataSourceAccessor {...props} />
    </DataTableProvider>
  );

  return sourceType === 'Form'
    ? !isNullOrWhiteSpace(props.propertyName)
      ? (
        <FormItem name={props.propertyName}>
          {provider}
        </FormItem>
      )
      : throwError("Name of the form item can't be empty")
    : provider;
};

export const DataSource: FC<IDataSourceComponentProps> = (props) => {
  const uniqueKey = `${props.sourceType}_${props.propertyName}_${getEntityTypeName(props.entityType) ?? props.endpoint}`; // is used just for re-rendering
  const provider = <DataSourceInner key={uniqueKey} {...props} />;

  return isEntityTypeId(props.entityType) ? (
    <MetadataProvider id={props.id} modelType={props.entityType}>
      {provider}
    </MetadataProvider>
  ) : (
    provider
  );
};
