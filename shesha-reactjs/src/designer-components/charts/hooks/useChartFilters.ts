import { useEffect, useState, useMemo, useRef } from 'react';
import { evaluateDynamicFiltersSync } from '@/utils';
import { useAvailableConstantsData, useDataContextManager, useMetadataDispatcher, IModelMetadata } from '@/index';
import { IChartProps } from '../model';

interface UseChartFiltersResult {
    stateEvaluatedFilters: string;
    filtersReady: boolean;
    filterError: string | undefined;
}

export const useChartFilters = (model: IChartProps): UseChartFiltersResult => {
    const allAvailableData = useAvailableConstantsData();
    const dataContextManager = useDataContextManager();
    const { getMetadata } = useMetadataDispatcher();
    const [stateEvaluatedFilters, setStateEvaluatedFilters] = useState<string>('');
    const [metaData, setMetaData] = useState<IModelMetadata>(undefined);
    const [filtersReady, setFiltersReady] = useState<boolean>(false);
    const [filterError, setFilterError] = useState<string | undefined>(undefined);

    // Use refs to track current filter state and prevent race conditions
    const filtersRef = useRef<string>('');
    const filtersReadyRef = useRef<boolean>(false);

    useEffect(() => {
        getMetadata({ modelType: model.entityType, dataType: 'entity' })
            .then(setMetaData)
            .catch(error => {
                console.error('Error getting entity metadata:', error);
                setFilterError('Error getting entity metadata');
            });
    }, [model.entityType, getMetadata]);

    // Memoize the data context values to prevent unnecessary re-renders
    const pageContext = useMemo(() => dataContextManager?.getPageContext(), [dataContextManager]);
    const contextsData = useMemo(() => dataContextManager?.getDataContextsData(), [dataContextManager]);

    useEffect(() => {
        if (!model.filters) {
            filtersRef.current = '';
            filtersReadyRef.current = true;
            setStateEvaluatedFilters('');
            setFiltersReady(true);
            setFilterError(undefined);
            return;
        }

        // Check if we have all required data for filter evaluation
        if (!metaData?.properties) {
            console.warn('Waiting for metadata to evaluate filters');
            return;
        }

        const match = [
            { match: 'data', data: allAvailableData.form?.data },
            { match: 'globalState', data: allAvailableData.globalState },
            { match: 'pageContext', data: pageContext },
            contextsData ? { match: 'contexts', data: contextsData } : null
        ].filter(Boolean);

        try {
            const response = evaluateDynamicFiltersSync(
                [{ expression: model.filters } as any],
                match,
                metaData?.properties
            );

            const strFilters = JSON.stringify(response[0]?.expression || '');

            // Update both ref and state atomically
            filtersRef.current = strFilters;
            filtersReadyRef.current = true;
            setStateEvaluatedFilters(strFilters);
            setFiltersReady(true);
            setFilterError(undefined);
        } catch (error) {
            console.error('Error evaluating filters:', error);
            filtersRef.current = '';
            filtersReadyRef.current = false;
            setStateEvaluatedFilters('');
            setFiltersReady(false);
            setFilterError(error instanceof Error ? error.message : 'Error evaluating filters');
        }
    }, [metaData?.properties, model.filters, allAvailableData.form?.data, allAvailableData.globalState, pageContext, contextsData]);

    return {
        stateEvaluatedFilters,
        filtersReady,
        filterError
    };
}; 