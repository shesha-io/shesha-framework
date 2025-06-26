import { useGet } from '@/hooks';
import { useMetadataDispatcher, useNestedPropertyMetadatAccessor } from '@/index';
import { IPropertyMetadata, IRefListPropertyMetadata } from '@/interfaces/metadata';
import { useFormEvaluatedFilter } from '@/providers/dataTable/filters/evaluateFilter';
import { useReferenceListDispatcher } from '@/providers/referenceListDispatcher';
import { toCamelCase } from '@/utils/string';
import { Alert, Button, Flex } from 'antd';
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useChartDataActionsContext, useChartDataStateContext } from '../../providers/chartData';
import { useProcessedChartData } from './hooks';
import { IChartData, IChartsProps } from './model';
import useStyles from './styles';
import { formatDate, getChartDataRefetchParams, getResponsiveStyle, processItems, renderChart, sortItems, validateEntityProperties } from './utils';
import ChartLoader from './components/chartLoader';
import { useTheme } from '@/providers/theme';

const ChartControl: React.FC<IChartsProps> = React.memo((props) => {
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
    ...state
  } = useChartDataStateContext();

  const { refetch } = useGet({ path: '', lazy: true });
  const { getMetadata } = useMetadataDispatcher();
  const { getReferenceList } = useReferenceListDispatcher();
  const { setData, setIsLoaded, setAxisPropertyLabel, setValuePropertyLabel } = useChartDataActionsContext();
  const { theme } = useTheme();
  // Optimize state initialization with lazy initial state
  const [metadataProcessed, setMetadataProcessed] = useState(false);
  const isFetchingRef = useRef(false);
  const [faultyProperties, setFaultyProperties] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);

  const { styles, cx } = useStyles();

  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(entityType);
  const evaluatedFilters = useFormEvaluatedFilter({ metadataAccessor: propertyMetadataAccessor, filter: props.filters });

  // Memoize the missing properties check to prevent unnecessary re-renders
  const missingPropertiesInfo = useMemo(() => {
    const missingProperties: string[] = [];
    if (!entityType) missingProperties.push("'entityType'");
    if (!chartType) missingProperties.push("'chartType'");
    if (!valueProperty) missingProperties.push("'valueProperty'");
    if (!axisProperty) missingProperties.push("'axisProperty'");

    return {
      hasMissingProperties: missingProperties.length > 0,
      descriptionMessage: `Please make sure that you've configured the following properties correctly: ${[...new Set(missingProperties)].join(', ')}.`
    };
  }, [entityType, chartType, valueProperty, axisProperty]);

  // Memoize the chart container styles to prevent unnecessary re-renders
  const chartContainerStyle = useMemo(() => ({
    ...getResponsiveStyle(state),
    width: '100%',
    height: '100%',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    margin: 0,
    boxSizing: 'border-box' as const,
    overflow: 'hidden'
  }), [state]);
  const chartInnerStyle = useMemo(() => ({
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
    minHeight: '350px'
  }), []);

  // Memoize the processAndUpdateData callback with stable dependencies
  const processAndUpdateData = useCallback((items: any[], refListMap: Map<string, Map<any, string>>) => {
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
  }, [isAxisTimeSeries, axisProperty, timeSeriesFormat, isGroupingTimeSeries, groupingTimeSeriesFormat, groupingProperty, setData]);

  const fetchData = useCallback(() => {
    if (isFetchingRef.current || !entityType || !valueProperty || !axisProperty) {
      return;
    }

    // Clear any previous errors and faulty properties
    setError(undefined);
    setFaultyProperties([]);
    isFetchingRef.current = true;

    // Create reference list lookup maps - declare outside promise chain for scope
    const refListMap = new Map<string, Map<any, string>>();

    // Get metadata first to identify reference list properties
    getMetadata({ modelType: entityType, dataType: 'entity' })
      .then((metaData) => {
        const faultyPropertiesInner = validateEntityProperties(metaData?.properties as IPropertyMetadata[], axisProperty, valueProperty, groupingProperty);
        
        // Instead of blocking the chart, just warn about invalid properties
        if (faultyPropertiesInner.length > 0) {
          console.warn('Chart properties do not match entity type:', faultyPropertiesInner);
          setFaultyProperties(faultyPropertiesInner);
          // Continue with the chart rendering instead of blocking it
        }

        setAxisPropertyLabel((metaData?.properties as IPropertyMetadata[])?.find((property: IPropertyMetadata) => property.path?.toLowerCase() === axisProperty?.toLowerCase())?.label ?? axisProperty);
        setValuePropertyLabel((metaData?.properties as IPropertyMetadata[])?.find((property: IPropertyMetadata) => property.path?.toLowerCase() === valueProperty?.toLowerCase())?.label ?? valueProperty);

        // Pre-filter reference list properties and create lookup maps
        const refListProperties = (metaData.properties as Array<IRefListPropertyMetadata>).filter(
          (metaItem: IRefListPropertyMetadata) => metaItem.dataType === 'reference-list-item' && (metaItem.path.toLowerCase() === axisProperty.toLowerCase() || metaItem.path.toLowerCase() === groupingProperty?.toLowerCase())
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

            const valueMap = new Map();
            refListItem.items.forEach((x) => {
              valueMap.set(x.itemValue, x.item?.trim() || `${x.itemValue}`);
            });

            refListMap.set(fieldName, valueMap);
          } catch (err) {
            console.error('getReferenceList error:', err);
          }
        });

        // Wait for reference lists to load
        return Promise.all(refListPromises).then(() => {
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
            maxResultCount ?? -1
          );

          return refetch(params);
        });
      })
      .then((response) => {
        if (!response?.result) {
          throw new Error(response?.error ?? 'Invalid response structure, please check the properties (axisProperty, valueProperty, ..., filters) used in the chart to make sure they are valid for the chosen entity type and try again.');
        }
        const items = response.result.items ?? [];
        
        // Process and update data
        processAndUpdateData(items, refListMap);
        setIsLoaded(true);
        setMetadataProcessed(true);
      })
      .catch((error) => {
        console.error('Error in fetchAndProcessData:', error);
        // Ensure error is always a string to prevent React rendering issues
        const errorMessage = error instanceof Error 
          ? error.message 
          : typeof error === 'string' 
            ? error 
            : 'An error occurred while fetching chart data';
        setError(errorMessage);
        setIsLoaded(true);
        setMetadataProcessed(false);
      })
      .finally(() => {
        isFetchingRef.current = false;
      });
  }, [entityType, valueProperty, axisProperty, groupingProperty, orderBy, orderDirection, evaluatedFilters, maxResultCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const errorAlert = useMemo(() => {
    if (!error) return null;

    return (
      <Alert
        showIcon
        message="Error loading chart data"
        description={error}
        type="error"
        action={
          <Button color={theme.application.errorColor ?? 'red'} onClick={() => {
            fetchData();
          }}>
            Retry
          </Button>
        }
      />
    );
  }, [error, fetchData]);

  // Memoize the loader component
  const loaderComponent = useMemo(() => {
    if (state.isLoaded && metadataProcessed) return null;

    return (
      <Flex
        align="center"
        justify="center"
        vertical
        gap={16}
      >
        <ChartLoader chartType={chartType} />
        <div className={cx(styles.loadingText)}>Fetching data...</div>
      </Flex>
    );
  }, [state.isLoaded, metadataProcessed, chartType, cx, styles.loadingText]);

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

ChartControl.displayName = 'ChartControl';

export default ChartControl;