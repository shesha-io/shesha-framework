import _ from 'lodash';
import React, { FC, useEffect } from 'react';
import TableViewSelectorRenderer from '@/components/tableViewSelectorRenderer';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import { evaluateDynamicFilters } from '@/utils/datatable';
import { ITableViewSelectorComponentProps } from './models';
import { useTheme } from '@/providers/theme';
import {
  useDataContextManagerOrUndefined,
  useDataFetchDependency,
  useDataTableStore,
  useGlobalState,
  useNestedPropertyMetadatAccessor,
  useSheshaApplication,
} from '@/providers';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { useShaFormDataUpdate, useShaFormInstance } from '@/providers/form/providers/shaFormProvider';
import { useDataContextOrUndefined } from '@/providers/dataContextProvider/contexts';

type ITableViewSelectorProps = ITableViewSelectorComponentProps;

export const TableViewSelector: FC<ITableViewSelectorProps> = ({
  id,
  filters,
  hidden,
  persistSelectedFilters,
  showIcon,
}) => {
  const {
    changeSelectedStoredFilterIds,
    selectedStoredFilterIds,
    setPredefinedFilters,
    predefinedFilters,
    changePersistedFiltersToggle,
    modelType,
  } = useDataTableStore();

  const { theme } = useTheme();

  // ToDo: AS - need to optimize
  useShaFormDataUpdate();

  const application = useSheshaApplication();
  const { globalState } = useGlobalState();
  const { formData, formMode } = useShaFormInstance();
  const dataContextManager = useDataContextManagerOrUndefined();
  const pageContext = dataContextManager?.getPageContext();
  const dataContext = useDataContextOrUndefined();
  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(modelType);

  const selectedFilterId =
    selectedStoredFilterIds && selectedStoredFilterIds.length > 0 ? selectedStoredFilterIds[0] : null;

  const dataFetchDep = useDataFetchDependency(id);

  // Inject CSS for hint popover arrow styling
  useEffect(() => {
    const styleId = 'sha-table-view-selector-hint-popover-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .sha-table-view-selector-hint-popover .ant-popover-arrow:before,
        .sha-table-view-selector-hint-popover .ant-popover-arrow:after {
          background: #D9DCDC !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  //#region Filters
  const debounceEvaluateDynamicFiltersHelper = (): void => {
    const match = [
      { match: 'data', data: formData },
      { match: 'globalState', data: globalState },
      { match: 'pageContext', data: { ...pageContext?.getFull() } },
    ];

    if (dataContextManager)
      match.push({ match: 'contexts', data: dataContextManager.getDataContextsData(dataContext?.id) });

    const permissionedFilters = filters.filter((f) => !f.permissions || (f.permissions && application.anyOfPermissionsGranted(f.permissions)));

    evaluateDynamicFilters(
      permissionedFilters,
      match,
      propertyMetadataAccessor,
    ).then((evaluatedFilters) => {
      dataFetchDep.ready();
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

  const changeSelectedFilter = (id: string): void => {
    changeSelectedStoredFilterIds(id ? [id] : []);
  };

  const defaultTitle = predefinedFilters?.length ? predefinedFilters[0]?.name : null;

  const isDesignerMode = formMode === 'designer';

  if (!defaultTitle) {
    if (isDesignerMode) {
      // WYSIWYG fallback when no filters are configured
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            backgroundColor: '#fafafa',
            color: '#8c8c8c',
            fontSize: '14px',
            fontWeight: 600,
          }}
          >
            View: Default
          </div>
          <Popover
            placement="right"
            title="Hint:"
            classNames={{ root: "sha-table-view-selector-hint-popover" }}
            styles={{ body: { backgroundColor: '#D9DCDC' } }}
            content={(
              <p>The Table View Selector needs at least<br />one filter configured to be functional.<br />Add filters in the component settings.
                <br />
                <br />
                <a href="https://docs.shesha.io/docs/category/tables-and-lists" target="_blank" rel="noopener noreferrer">See component documentation</a><br />for setup and usage.
              </p>
            )}
          >
            <InfoCircleOutlined style={{ color: theme.application?.warningColor, cursor: 'help' }} />
          </Popover>
        </div>
      );
    }

    return null;
  }

  return (
    <TableViewSelectorRenderer
      hidden={hidden && !isDesignerMode}
      filters={predefinedFilters || []}
      onSelectFilter={changeSelectedFilter}
      selectedFilterId={selectedFilterId}
      showIcon={showIcon}
    />
  );
};
