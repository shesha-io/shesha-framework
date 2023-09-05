import React, { FC, MutableRefObject, useEffect } from 'react';
import { IToolboxComponent } from 'interfaces';
import { SelectOutlined } from '@ant-design/icons';
import TableViewSelectorSettings from './tableViewSelectorSettings';
import { ITableViewSelectorComponentProps } from './models';
import { useDataTableStore, useGlobalState, useForm, useNestedPropertyMetadatAccessor } from 'providers';
import camelCaseKeys from 'camelcase-keys';
import _ from 'lodash';
import { Alert } from 'antd';
import { useDeepCompareEffect } from 'react-use';
import TableViewSelectorRenderer from 'components/tableViewSelectorRenderer';
import { migrateFilterMustacheExpressions } from 'designer-components/_common-migrations/migrateUseExpression';
import { evaluateDynamicFilters } from 'utils';
import { migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';
import { useDataContextManager } from 'providers/dataContextManager';
import { useDataContext } from 'providers/dataContextProvider';

const TableViewSelectorComponent: IToolboxComponent<ITableViewSelectorComponentProps> = {
  type: 'tableViewSelector',
  name: 'Table view selector',
  icon: <SelectOutlined />,
  factory: (model: ITableViewSelectorComponentProps, componentRef: MutableRefObject<any>) => {
    return <TableViewSelector {...model} componentRef={componentRef} />;
  },
  migrator: m => m.add<ITableViewSelectorComponentProps>(0, prev => {
    return {
      ...prev,
      title: prev['title'] ?? 'Title',
      filters: prev['filters'] ?? [],
      componentRef: prev['componentRef']
    };
  })
    .add(1, prev => (
      { ...prev, filters: prev.filters.map(filter => migrateFilterMustacheExpressions(filter)) }
    ))
    .add(2, (prev) => migratePropertyName(prev))
  ,
  settingsFormFactory: ({ readOnly, model, onSave, onCancel, onValuesChange }) => {
    return (
      <TableViewSelectorSettings
        readOnly={readOnly}
        model={model as ITableViewSelectorComponentProps}
        onSave={onSave}
        onCancel={onCancel}
        onValuesChange={onValuesChange}
      />
    );
  },
};

interface ITableViewSelectorProps extends ITableViewSelectorComponentProps {
  componentRef: MutableRefObject<any>;
}

export const TableViewSelector: FC<ITableViewSelectorProps> = ({ filters, hidden, componentRef, persistSelectedFilters }) => {
  const {
    columns,
    changeSelectedStoredFilterIds,
    selectedStoredFilterIds,
    setPredefinedFilters,
    predefinedFilters,
    changePersistedFiltersToggle,
    modelType,
  } = useDataTableStore();
  const { globalState } = useGlobalState();
  const { formData, formMode } = useForm();
  const dataContextManager = useDataContextManager(false);
  const dataContext = useDataContext(false);
  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(modelType);

  componentRef.current = {
    columns,
  };

  const selectedFilterId =
    selectedStoredFilterIds && selectedStoredFilterIds.length > 0 ? selectedStoredFilterIds[0] : null;

  //#region Filters
  const debounceEvaluateDynamicFiltersHelper = () => {
    const data = !_.isEmpty(formData) ? camelCaseKeys(formData, { deep: true, pascalCase: true }) : formData;

    const match = [
      { match: 'data', data: data },
      { match: 'globalState', data: globalState },
    ];

    if (dataContextManager)
      match.push({ match: 'contexts', data: dataContextManager.getDataContextsData(dataContext?.id)});

    evaluateDynamicFilters(
      filters,
      match,
      propertyMetadataAccessor
    ).then(evaluatedFilters => {
      setPredefinedFilters(evaluatedFilters);
    });
  };

  useDeepCompareEffect(() => {
    debounceEvaluateDynamicFiltersHelper();
  }, [filters, formData, globalState, dataContextManager.lastUpdate]);

  useEffect(() => {
    changePersistedFiltersToggle(persistSelectedFilters);
  }, [persistSelectedFilters]);
  //#endregion

  const changeSelectedFilter = (id: string) => {
    changeSelectedStoredFilterIds(id ? [id] : []);
  };

  const defaultTitle = predefinedFilters?.length ? predefinedFilters[0]?.name : null;

  const isDesignerMode = formMode === 'designer';

  if (!defaultTitle) {
    if (isDesignerMode) {
      return <Alert message="Please make sure that you have at least 1 filter" type="warning" showIcon />;
    }

    return null;
  }

  return (
    <TableViewSelectorRenderer
      hidden={hidden && !isDesignerMode}
      filters={predefinedFilters || []}
      onSelectFilter={changeSelectedFilter}
      selectedFilterId={selectedFilterId}
    />
  );
};

export default TableViewSelectorComponent;
