import { useGet } from '@/hooks';
import { useMetadataDispatcher } from '@/index';
import { IPropertyMetadata, IRefListPropertyMetadata } from '@/interfaces/metadata';
import { useReferenceListDispatcher } from '@/providers/referenceListDispatcher';
import { toCamelCase } from '@/utils/string';
import { Alert, Button } from 'antd';
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useChartDataActionsContext, useChartDataStateContext } from '../../providers/chartData';
import { useProcessedChartData } from './hooks/hooks';
import { IChartData, IChartsProps } from './model';
import useStyles from './styles';
import { formatDate, getChartDataRefetchParams, getResponsiveStyle, processItems, renderChart, sortItems, validateEntityProperties } from './utils';
import ChartLoader from './components/chartLoader';
import { EntityData, IAbpWrappedGetEntityListResponse } from '@/interfaces/gql';

const chartInnerStyle = {
  width: '100%',
  height: '100%',
  position: 'relative' as const,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  margin: 0,
  overflow: 'hidden',
};

const ChartControl: React.FC<IChartsProps & { evaluatedFilters?: string }> = React.memo(({ evaluatedFilters }) => {
  const {
    chartType,
    entityType,
    valueProperty,
    groupingProperty,
    axisProperty,
    filterProperties,
    isAxisTimeSeries,
    timeSeriesFormat,
    orderBy,
    orderDirection,
    isGroupingTimeSeries,
    groupingTimeSeriesFormat,
    axisPropertyLabel,
    valuePropertyLabel,
    filters,
    maxResultCount,
    requestTimeout = 5000, // Default 5 seconds
    ...state
  } = useChartDataStateContext();

  const { refetch } = useGet<IAbpWrappedGetEntityListResponse>({ path: '', lazy: true });
  const { getMetadata } = useMetadataDispatcher();
  const { getReferenceList } = useReferenceListDispatcher();
  const { setData, setIsLoaded, setAxisPropertyLabel, setValuePropertyLabel } = useChartDataActionsContext();
  // Optimize state initialization with lazy initial state
  const [metadataProcessed, setMetadataProcessed] = useState(false);
  const isFetchingRef = useRef(false);
  const [faultyProperties, setFaultyProperties] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  const { styles, cx } = useStyles();
  const currentControllerRef = useRef<AbortController | null>(null);

  // Memoize the missing properties check to prevent unnecessary re-renders
  const missingPropertiesInfo = useMemo(() => {
    const missingProperties: string[] = [];
    if (!entityType) missingProperties.push("'entityType'");
    if (!chartType) missingProperties.push("'chartType'");
    if (!valueProperty) missingProperties.push("'valueProperty'");
    if (!axisProperty) missingProperties.push("'axisProperty'");

    return {
      hasMissingProperties: missingProperties.length > 0,
      descriptionMessage: `Please make sure that you've configured the following properties correctly: ${[...new Set(missingProperties)].join(', ')}.`,
    };
  }, [entityType, chartType, valueProperty, axisProperty]);

  // Memoize the chart container styles to prevent unnecessary re-renders
  const chartContainerStyle = useMemo(() => ({
    ...getResponsiveStyle(state),
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    margin: 0,
    boxSizing: 'border-box' as const,
    overflow: 'hidden',
  }), [state]);

  const processAndUpdateData = (items: EntityData[], refListMap: Map<string, Map<number, string>>): void => {
    // Process all items efficiently
    let processedItems = processItems(items, refListMap);

    // Sort items
    processedItems = sortItems(processedItems, isAxisTimeSeries, axisProperty);

    // Format dates
    processedItems = formatDate(processedItems, timeSeriesFormat, [axisProperty]);
    if (isGroupingTimeSeries) {
      processedItems = formatDate(processedItems, groupingTimeSeriesFormat, [groupingProperty]);
    }

    setData(processedItems);
  };

  const fetchData = useCallback(() => {
    // Early return if already fetching or missing required properties
    if (isFetchingRef.current || !entityType || !valueProperty || !axisProperty) {
      return;
    }

    const newController = new AbortController();
    currentControllerRef.current = newController;

    // Set up timeout (configurable, default 5 seconds)
    const timeoutId = setTimeout(() => {
      if (currentControllerRef.current) {
        isFetchingRef.current = false;
        setError(`Request timed out after ${requestTimeout / 1000} seconds`);
        setIsLoaded(true);
        setMetadataProcessed(false);
      }
    }, requestTimeout);

    // Clear any previous errors and faulty properties
    setError(undefined);
    setFaultyProperties([]);
    isFetchingRef.current = true;

    // Create reference list lookup maps - declare outside promise chain for scope
    const refListMap = new Map<string, Map<number, string>>();

    // Function to validate and fetch data
    const validateAndFetchData = async (): Promise<IAbpWrappedGetEntityListResponse> => {
      // Check if maxResultCount is explicitly set and validate it
      if (maxResultCount !== undefined && maxResultCount !== -1) {
        if (maxResultCount > 10000) {
          throw new Error(`Requested result count (${maxResultCount}) exceeds the maximum allowed limit of 10,000. Please reduce the result count or add filters to limit the data.`);
        }
      }

      // Get metadata first to identify reference list properties
      const metaData = await getMetadata({ modelType: entityType, dataType: 'entity' });

      const faultyPropertiesInner = validateEntityProperties(metaData?.properties as IPropertyMetadata[], axisProperty, valueProperty, groupingProperty);

      // Instead of blocking the chart, just warn about invalid properties
      if (faultyPropertiesInner.length > 0) {
        console.warn('Chart properties do not match entity type:', faultyPropertiesInner);
        setFaultyProperties(faultyPropertiesInner);
        // Continue with the chart rendering instead of blocking it
      }

      if (!axisPropertyLabel || axisPropertyLabel?.trim().length === 0) {
        setAxisPropertyLabel((metaData?.properties as IPropertyMetadata[])?.find((property: IPropertyMetadata) => property.path?.toLowerCase() === axisProperty?.toLowerCase())?.label ?? axisProperty);
      }
      if (!valuePropertyLabel || valuePropertyLabel.trim().length === 0) {
        setValuePropertyLabel((metaData?.properties as IPropertyMetadata[])?.find((property: IPropertyMetadata) => property.path?.toLowerCase() === valueProperty?.toLowerCase())?.label ?? valueProperty);
      }

      // Pre-filter reference list properties and create lookup maps
      const refListProperties = (metaData.properties as Array<IRefListPropertyMetadata>).filter(
        (metaItem: IRefListPropertyMetadata) => metaItem.dataType === 'reference-list-item' && (metaItem.path.toLowerCase() === axisProperty.toLowerCase() || metaItem.path.toLowerCase() === groupingProperty?.toLowerCase()),
      );

      const refListPromises = refListProperties.map(async (metaItem: IRefListPropertyMetadata) => {
        const fieldName = toCamelCase(metaItem.path);
        try {
          const refListItem = await getReferenceList({
            refListId: {
              module: metaItem.referenceListModule,
              name: metaItem.referenceListName,
            },
          }).promise;

          const valueMap = new Map<number, string>();
          refListItem.items.forEach((x) => {
            valueMap.set(x.itemValue, x.item?.trim() || `${x.itemValue}`);
          });

          refListMap.set(fieldName, valueMap);
        } catch (err) {
          console.error('getReferenceList error:', err);
        }
      });

      // Wait for reference lists to load
      await Promise.all(refListPromises);

      // Mark metadata as processed
      setMetadataProcessed(true);

      // Fetch all data in a single call
      const params = getChartDataRefetchParams(
        entityType,
        valueProperty,
        evaluatedFilters,
        groupingProperty,
        axisProperty,
        orderBy,
        orderDirection,
        0,
        maxResultCount ?? -1,
      );

      return refetch({ ...params, signal: newController.signal });
    };

    // Execute the validation and fetch process
    validateAndFetchData()
      .then((response) => {
        if (!response || !response.result) {
          throw new Error(response.error?.message ?? 'Invalid response structure, please check the properties (axisProperty, valueProperty, ..., filters) used in the chart to make sure they are valid for the chosen entity type and try again.');
        }
        const items = response.result.items ?? [];

        // Process and update data
        processAndUpdateData(items, refListMap);
        setIsLoaded(true);
        setMetadataProcessed(true);
      })
      .catch((error) => {
        console.error('Error in fetchAndProcessData:', error);

        // Handle different types of errors
        let errorMessage: string;

        if (error?.name === 'AbortError') {
          // Check if this is an intentional abort (restart, retry, unmount, or component initialization)
          const abortMessage = error?.message || '';
          const isIntentionalAbort = abortMessage.includes('Restarting chart') ||
            abortMessage.includes('Retry fetch initiated') ||
            abortMessage.includes('Unmounting chart') ||
            abortMessage.includes('Request cancelled by user') ||
            abortMessage.includes('Component initialization');

          if (isIntentionalAbort) {
            // Don't set error for intentional aborts - just clean up
            isFetchingRef.current = false;
            return;
          }

          // Handle timeout or other unintentional aborts
          errorMessage = abortMessage.includes('timeout')
            ? `Request timed out after ${requestTimeout / 1000} seconds`
            : 'Request was cancelled';
        } else if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else {
          errorMessage = 'An error occurred while fetching chart data';
        }

        setError(errorMessage);
        setIsLoaded(true);
        setMetadataProcessed(false);
      })
      .finally(() => {
        isFetchingRef.current = false;
        clearTimeout(timeoutId);
      });
  }, [
    entityType,
    valueProperty,
    axisProperty,
    groupingProperty,
    orderBy,
    orderDirection,
    evaluatedFilters,
    filters,
    maxResultCount,
    requestTimeout,
    groupingTimeSeriesFormat,
    timeSeriesFormat,
    isAxisTimeSeries,
    isGroupingTimeSeries,
    refetch,
    getMetadata,
    getReferenceList,
    setData,
    setIsLoaded,
    setAxisPropertyLabel,
    setValuePropertyLabel,
    setMetadataProcessed,
    setError,
    setFaultyProperties,
  ]);

  useEffect(() => {
    // Only fetch data if all required properties are properly configured
    const hasRequiredProperties = entityType && valueProperty && axisProperty && entityType.trim() !== '' && valueProperty.trim() !== '' && axisProperty.trim() !== '';

    if (!hasRequiredProperties) {
      // If missing required properties, just set loaded state without fetching
      setIsLoaded(true);
      setMetadataProcessed(false);
      setError(undefined);
      setFaultyProperties([]);
      return;
    }

    // Reset loading state when chart properties change
    setIsLoaded(false);
    setMetadataProcessed(false);
    setError(undefined);
    setFaultyProperties([]);

    fetchData();
  }, [entityType, valueProperty, axisProperty, groupingProperty, orderBy, orderDirection, filters, maxResultCount, requestTimeout, groupingTimeSeriesFormat, timeSeriesFormat, isAxisTimeSeries, isGroupingTimeSeries]);

  useEffect(() => {
    // Only fetch metadata if entityType is properly configured
    if (!entityType || entityType.trim() === '') {
      return;
    }

    getMetadata({ modelType: entityType, dataType: 'entity' }).then((metaData) => {
      if (metaData) {
        if (!axisPropertyLabel || axisPropertyLabel?.trim().length === 0) {
          setAxisPropertyLabel((metaData?.properties as IPropertyMetadata[])?.find((property: IPropertyMetadata) => property.path?.toLowerCase() === axisProperty?.toLowerCase())?.label ?? axisProperty);
        }
        if (!valuePropertyLabel || valuePropertyLabel.trim().length === 0) {
          setValuePropertyLabel((metaData?.properties as IPropertyMetadata[])?.find((property: IPropertyMetadata) => property.path?.toLowerCase() === valueProperty?.toLowerCase())?.label ?? valueProperty);
        }
      }
    }).catch((error) => {
      // Silently handle metadata fetch errors during component initialization
      console.warn('Failed to fetch metadata during chart initialization:', error);
    });
  }, [axisPropertyLabel, valuePropertyLabel, entityType, valueProperty, axisProperty, getMetadata, setAxisPropertyLabel, setValuePropertyLabel]);

  // Cleanup effect to abort requests on unmount
  useEffect(() => {
    return () => {
      if (currentControllerRef.current && isFetchingRef.current) {
        try {
          currentControllerRef.current.abort('Unmounting chart');
        } catch {
          // Ignore abort errors during unmount - this is expected behavior
        }
      }
    };
  }, []);

  const data: IChartData = useProcessedChartData();

  // Memoize Alert components to prevent re-renders
  const faultyPropertiesAlert = useMemo(() => {
    if (faultyProperties.length === 0) return null;

    return (
      <Alert
        showIcon
        message="Some chart properties don't match the current entity type"
        description={`The following properties may not work as expected: ${faultyProperties.join(', ')}. The chart will attempt to use available data properties instead.`}
        type="warning"
        closable
      />
    );
  }, [faultyProperties]);

  const missingPropertiesAlert = useMemo(() => {
    if (entityType && chartType && valueProperty && axisProperty) return null;

    return (
      <Alert
        showIcon
        message="Chart control properties not set correctly!"
        description={missingPropertiesInfo.descriptionMessage}
        type="warning"
      />
    );
  }, [entityType, chartType, valueProperty, axisProperty, missingPropertiesInfo.descriptionMessage]);

  const retryFetch = useCallback(() => {
    // Reset loading state for retry
    setIsLoaded(false);
    setMetadataProcessed(false);
    setError(undefined);
    setFaultyProperties([]);

    // Only abort if there's an existing request
    if (currentControllerRef.current && isFetchingRef.current) {
      try {
        currentControllerRef.current.abort('Retry fetch initiated');
      } catch {
        // Ignore abort errors during retry - this is expected behavior
      }
    }
    isFetchingRef.current = false;

    // Start new fetch with timeout
    fetchData();
  }, [setIsLoaded, setMetadataProcessed, setError, setFaultyProperties]);

  const errorAlert = useMemo(() => {
    if (!error) return null;

    const isUserCancelled = error.includes('cancelled by user') || error.includes('Cancelled by user');
    const isTimeoutError = error.includes('timed out');
    const message = isUserCancelled ? "Request cancelled" : isTimeoutError ? "Request timed out" : "Error loading chart data";

    return (
      <Alert
        showIcon
        message={message}
        description={error}
        type="error"
        action={(
          <Button color="danger" size="small" onClick={retryFetch}>
            Retry
          </Button>
        )}
      />
    );
  }, [error, retryFetch]);

  // Memoize the loader component
  const loaderComponent = useMemo(() => {
    return (
      <div className={cx(styles.loadingContainer)}>
        <ChartLoader
          chartType={chartType}
          handleCancelClick={() => {
            if (isFetchingRef.current && currentControllerRef.current) {
              isFetchingRef.current = false;
              setError('Request cancelled by user');
              setIsLoaded(true);
              setMetadataProcessed(false);
              try {
                currentControllerRef.current.abort('Request cancelled by user');
              } catch {
                // Ignore abort errors during user cancellation - this is expected behavior
              }
            }
          }}
        />
        <div className={cx(styles.loadingText)}>Fetching data...</div>
      </div>
    );
  }, [state.isLoaded, metadataProcessed, chartType, cx, styles.loadingContainer, styles.loadingText, setIsLoaded, setMetadataProcessed]);

  // Early returns with memoized components
  if (error) {
    return errorAlert;
  }

  if (!entityType || !chartType || !valueProperty || !axisProperty) {
    return missingPropertiesAlert;
  }

  // Show loader only if we don't have any data yet
  if (!state.isLoaded || !metadataProcessed) {
    return loaderComponent;
  }

  return (
    <div style={chartContainerStyle}>
      {/* Show warning about invalid properties but don't block the chart */}
      {faultyPropertiesAlert && (
        <div style={{ marginBottom: '16px' }}>
          {faultyPropertiesAlert}
        </div>
      )}
      <div style={chartInnerStyle}>
        {renderChart(chartType, data)}
      </div>
    </div>
  );
});

ChartControl.displayName = "ChartControl";

export default ChartControl;
