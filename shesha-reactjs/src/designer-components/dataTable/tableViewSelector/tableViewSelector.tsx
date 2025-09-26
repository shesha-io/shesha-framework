import _ from 'lodash';
import React, { FC, useEffect } from 'react';
import TableViewSelectorRenderer from '@/components/tableViewSelectorRenderer';
import { Alert } from 'antd';
import { evaluateDynamicFilters } from '@/utils';
import { ITableViewSelectorComponentProps } from './models';
import { useDataContextOrUndefined } from '@/providers/dataContextProvider/contexts';
import { useDataContextManagerOrUndefined } from '@/providers/dataContextManager';
import {
    useDataFetchDependency,
    useDataTableStore,
    useGlobalState,
    useNestedPropertyMetadatAccessor,
    useSheshaApplication
} from '@/providers';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { useShaFormDataUpdate, useShaFormInstance } from '@/providers/form/providers/shaFormProvider';

interface ITableViewSelectorProps extends ITableViewSelectorComponentProps {
}

export const TableViewSelector: FC<ITableViewSelectorProps> = ({
    id,
    filters,
    hidden,
    persistSelectedFilters,
}) => {
    const {
        changeSelectedStoredFilterIds,
        selectedStoredFilterIds,
        setPredefinedFilters,
        predefinedFilters,
        changePersistedFiltersToggle,
        modelType,
    } = useDataTableStore();

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
    const debounceEvaluateDynamicFiltersHelper = () => {
        const match = [
            { match: 'data', data: formData },
            { match: 'globalState', data: globalState },
            { match: 'pageContext', data: {...pageContext?.getFull()} },
        ];

        if (dataContextManager)
            match.push({ match: 'contexts', data: dataContextManager.getDataContextsData(dataContext?.id) });

        const permissionedFilters = filters.filter(f => !f.permissions || f.permissions && application.anyOfPermissionsGranted(f.permissions));

        evaluateDynamicFilters(
          permissionedFilters,
          match,
          propertyMetadataAccessor
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