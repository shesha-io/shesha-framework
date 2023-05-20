import React, { FC, MutableRefObject } from 'react';
import { IToolboxComponent } from 'interfaces';
import { SelectOutlined } from '@ant-design/icons';
import TableViewSelectorSettings from './tableViewSelectorSettings';
import { ITableViewSelectorComponentProps } from './models';
import { useDataTableStore, useGlobalState, useForm, useNestedPropertyMetadatAccessor } from 'providers';
import { evaluateDynamicFilters } from 'providers/dataTable/utils';
import camelCaseKeys from 'camelcase-keys';
import _ from 'lodash';
import { Alert } from 'antd';
import { useDeepCompareEffect } from 'react-use';
import TableViewSelectorRenderer from 'components/tableViewSelectorRenderer';
import { migrateFilterMustacheExpressions } from 'designer-components/_common-migrations/migrateUseExpression';

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
      componentRef: prev['componentRef'],
    };
  })
    .add(1, prev => (
      { ...prev, filters: prev.filters.map(filter => migrateFilterMustacheExpressions(filter)) }
    )),
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

export const TableViewSelector: FC<ITableViewSelectorProps> = ({ filters, componentRef, persistSelectedFilters }) => {
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
  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(modelType);

  componentRef.current = {
    columns,
  };

  const selectedFilterId =
    selectedStoredFilterIds && selectedStoredFilterIds.length > 0 ? selectedStoredFilterIds[0] : null;

  //#region Filters
  const debounceEvaluateDynamicFiltersHelper = () => {
    const data = !_.isEmpty(formData) ? camelCaseKeys(formData, { deep: true, pascalCase: true }) : formData;

    evaluateDynamicFilters(
      filters,
      [
        { match: 'data', data: data },
        { match: 'globalState', data: globalState },
      ],
      propertyMetadataAccessor
    ).then(evaluatedFilters => {
      setPredefinedFilters(evaluatedFilters);
    });
  };

  useDeepCompareEffect(() => {
    debounceEvaluateDynamicFiltersHelper();
  }, [filters, formData, globalState]);

  useDeepCompareEffect(() => {
    changePersistedFiltersToggle(persistSelectedFilters);
  }, [persistSelectedFilters]);
  //#endregion

  const changeSelectedFilter = (id: string) => {
    changeSelectedStoredFilterIds(id ? [id] : []);
  };

  const defaultTitle = predefinedFilters?.length ? predefinedFilters[0]?.name : null;

  if (!defaultTitle) {
    if (formMode === 'designer') {
      return <Alert message="Please make sure that you have at least 1 filter" type="warning" showIcon />;
    }

    return null;
  }

  return (
    <TableViewSelectorRenderer
      filters={predefinedFilters || []}
      onSelectFilter={changeSelectedFilter}
      selectedFilterId={selectedFilterId}
    />
  );
};

export default TableViewSelectorComponent;
