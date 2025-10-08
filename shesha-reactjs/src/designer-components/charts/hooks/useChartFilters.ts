import { useEffect, useState, useMemo, useRef } from 'react';
import { evaluateDynamicFiltersSync } from '@/utils/datatable';
import { useAvailableConstantsData, useDataContextManager, useMetadataDispatcher, IModelMetadata } from '@/index';
import { IChartProps } from '../model';
import { FilterExpression, IStoredFilter } from '@/providers/dataTable/interfaces';

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
      .catch((error) => {
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
      contextsData ? { match: 'contexts', data: contextsData } : null,
    ].filter(Boolean);

    try {
      // Convert the filter expression to IStoredFilter format
      const filterExpression2Object = (filter: FilterExpression): object => {
        return typeof filter === 'string' ? JSON.parse(filter) : filter;
      };

      // Handle multiple filters by converting to array of IStoredFilter objects
      let filters: IStoredFilter[] = [];

      if (Array.isArray(model.filters)) {
        // If filters is an array, convert each item to IStoredFilter
        filters = model.filters.map((filter, index) => ({
          id: `chart-filter-${index}`,
          name: `Chart Filter ${index + 1}`,
          expression: filterExpression2Object(filter),
          selected: true,
          defaultSelected: true,
        }));
      } else {
        // If filters is a single expression, wrap it in an array
        filters = [{
          id: 'chart-filter-0',
          name: 'Chart Filter',
          expression: filterExpression2Object(model.filters),
          selected: true,
          defaultSelected: true,
        }];
      }

      const response = evaluateDynamicFiltersSync(
        filters,
        match,
        metaData?.properties,
      );

      // Combine multiple evaluated filters using 'and' operator
      let combinedFilters: FilterExpression | null = null;

      if (response.length === 0) {
        combinedFilters = null;
      } else if (response.length === 1) {
        combinedFilters = response[0]?.expression || null;
      } else {
        // Multiple filters - combine with 'and' operator
        const expressions = response
          .map((filter) => filter?.expression)
          .filter(Boolean);

        if (expressions.length === 0) {
          combinedFilters = null;
        } else if (expressions.length === 1) {
          combinedFilters = expressions[0];
        } else {
          combinedFilters = { and: expressions };
        }
      }

      const strFilters = combinedFilters ? JSON.stringify(combinedFilters) : '';

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
    filterError,
  };
};
