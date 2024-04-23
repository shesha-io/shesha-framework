import _ from 'lodash';
import React, { FC, MutableRefObject, useEffect } from 'react';
import TableViewSelectorRenderer from '@/components/tableViewSelectorRenderer';
import { Alert } from 'antd';
import { evaluateDynamicFilters } from '@/utils';
import { ITableViewSelectorComponentProps } from './models';
import { useDataContext } from '@/providers/dataContextProvider/contexts';
import { useDataContextManager } from '@/providers/dataContextManager';
import {
    useDataFetchDependency,
    useDataTableStore,
    useForm,
    useGlobalState,
    useNestedPropertyMetadatAccessor
} from '@/providers';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';

interface ITableViewSelectorProps extends ITableViewSelectorComponentProps {
    componentRef: MutableRefObject<any>;
}

export const TableViewSelector: FC<ITableViewSelectorProps> = ({
    id,
    filters,
    hidden,
    componentRef,
    persistSelectedFilters,
}) => {
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

    const dataFetchDep = useDataFetchDependency(id);

    //#region Filters
    const debounceEvaluateDynamicFiltersHelper = () => {
        const match = [
            { match: 'data', data: formData },
            { match: 'globalState', data: globalState },
        ];

        if (dataContextManager)
            match.push({ match: 'contexts', data: dataContextManager.getDataContextsData(dataContext?.id) });

        evaluateDynamicFilters(
            filters,
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