import React, { FC, MutableRefObject, useEffect } from 'react';
import { IToolboxComponent } from '../../../../../interfaces';
import { SelectOutlined } from '@ant-design/icons';
import TableViewSelectorSettings from './tableViewSelectorSettings';
import { ITableViewSelectorProps } from './models';
import { useForm } from '../../../../..';
import { useDataTableStore, useGlobalState } from '../../../../../providers';
import { evaluateDynamicFilters } from '../../../../../providers/dataTable/utils';
import camelCaseKeys from 'camelcase-keys';
import _ from 'lodash';
import { Alert, message } from 'antd';
import { useDeepCompareEffect } from 'react-use';
import TableViewSelectorRenderer from '../../../../tableViewSelectorRenderer';

const TableViewSelectorComponent: IToolboxComponent<ITableViewSelectorProps> = {
  type: 'tableViewSelector',
  name: 'Table view selector',
  icon: <SelectOutlined />,
  factory: (model: ITableViewSelectorProps, componentRef: MutableRefObject<any>) => {
    return <TableViewSelector componentRef={componentRef} {...model} />;
  },
  initModel: (model: ITableViewSelectorProps) => {
    return {
      ...model,
      title: 'Title',
      filters: [],
    };
  },
  settingsFormFactory: ({ readOnly, model, onSave, onCancel, onValuesChange }) => {
    return (
      <TableViewSelectorSettings
        readOnly={readOnly}
        model={model as ITableViewSelectorProps}
        onSave={onSave}
        onCancel={onCancel}
        onValuesChange={onValuesChange}
      />
    );
  },
};

export const TableViewSelector: FC<ITableViewSelectorProps> = ({ filters, componentRef, persistSelectedFilters }) => {
  const {
    columns,
    changeSelectedStoredFilterIds,
    selectedStoredFilterIds,
    setPredefinedFilters,
    predefinedFilters,
    changePersistedFiltersToggle,
    exportToExcelError,
    exportToExcelWarning,
  } = useDataTableStore();
  const { globalState } = useGlobalState();
  const { formData, formMode } = useForm();

  componentRef.current = {
    columns,
  };

  const selectedFilterId =
    selectedStoredFilterIds && selectedStoredFilterIds.length > 0 ? selectedStoredFilterIds[0] : null;

  useEffect(() => {
    if (exportToExcelError) {
      message.error(exportToExcelError);
    }
  }, [exportToExcelError]);

  useEffect(() => {
    if (exportToExcelWarning) {
      message.warn(exportToExcelWarning);
    }
  }, [exportToExcelWarning]);

  //#region Filters
  const debounceEvaluateDynamicFiltersHelper = () => {
    const data = !_.isEmpty(formData) ? camelCaseKeys(formData, { deep: true, pascalCase: true }) : formData;

    const evaluatedFilters = evaluateDynamicFilters(filters, [
      {
        match: 'data',
        data: data,
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
