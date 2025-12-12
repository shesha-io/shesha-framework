import _ from 'lodash';
import React, { FC, useEffect } from 'react';
import TableViewSelectorRenderer from '@/components/tableViewSelectorRenderer';
import { evaluateDynamicFilters } from '@/utils/datatable';
import { ITableViewSelectorComponentProps } from './models';
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
import { useStyles } from '../tableContext/styles';

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

  const { styles } = useStyles();

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
        <div className={styles.hintContainer}>
          <div className={styles.viewSelectorMockup}>
            View: Default
          </div>
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
