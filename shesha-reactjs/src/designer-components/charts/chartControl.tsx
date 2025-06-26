import { useGet } from '@/hooks';
import { useMetadataDispatcher, useNestedPropertyMetadatAccessor } from '@/index';
import { IPropertyMetadata, IRefListPropertyMetadata } from '@/interfaces/metadata';
import { useFormEvaluatedFilter } from '@/providers/dataTable/filters/evaluateFilter';
import { useReferenceListDispatcher } from '@/providers/referenceListDispatcher';
import { toCamelCase } from '@/utils/string';
import { Alert, Flex } from 'antd';
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useChartDataActionsContext, useChartDataStateContext } from '../../providers/chartData';
import { useProcessedChartData } from './hooks';
import { IChartData, IChartsProps } from './model';
import useStyles from './styles';
import { formatDate, getChartDataRefetchParams, getResponsiveStyle, processItems, renderChart, sortItems, validateEntityProperties } from './utils';
import ChartLoader from './components/chartLoader';

const ChartControl: React.FC<IChartsProps> = React.memo(() => {
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
    ...state
  } = useChartDataStateContext();

  const { refetch } = useGet({ path: '', lazy: true });
  const { getMetadata } = useMetadataDispatcher();
  const { getReferenceList } = useReferenceListDispatcher();
  const { setData, setIsLoaded, setAxisPropertyLabel, setValuePropertyLabel } = useChartDataActionsContext();

  // Optimize state initialization with lazy initial state
  const [metadataProcessed, setMetadataProcessed] = useState(false);
  const isFetchingRef = useRef(false);
  const [faultyProperties, setFaultyProperties] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { styles, cx } = useStyles();

  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(entityType);
  const evaluatedFilters = useFormEvaluatedFilter({ metadataAccessor: propertyMetadataAccessor, filter: state.filters });

  // Memoize the description message to prevent unnecessary re-renders
  const descriptionMessage = useMemo(() => {
    if (faultyProperties.length > 0) {
      return `Please make sure that you've configured the following properties correctly: ${faultyProperties.join(', ')}.`;
    }
    return '';
  }, [faultyProperties]);

  // Memoize the missing properties check to prevent unnecessary re-renders
  const missingPropertiesInfo = useMemo(() => {
    const missingProperties: string[] = [];
    if (!entityType) missingProperties.push("'entityType'");
    if (!chartType) missingProperties.push("'chartType'");
    if (!valueProperty) missingProperties.push("'valueProperty'");
    if (!axisProperty) missingProperties.push("'axisProperty'");

    if (faultyProperties?.length > 0) {
      missingProperties.push(...faultyProperties);
    }

    return {
      hasMissingProperties: missingProperties.length > 0,
      descriptionMessage: `Please make sure that you've configured the following properties correctly: ${[...new Set(missingProperties)].join(', ')}.`
    };
  }, [entityType, chartType, valueProperty, axisProperty, faultyProperties]);

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

  useEffect(() => {
    if (isFetchingRef.current || !entityType || !valueProperty || !axisProperty) {
      return;
    }

    // Clear any previous errors and faulty properties
    setError(null);
    setFaultyProperties([]);
    isFetchingRef.current = true;

    // Create reference list lookup maps - declare outside promise chain for scope
    const refListMap = new Map<string, Map<any, string>>();

    // Get metadata first to identify reference list properties
    getMetadata({ modelType: entityType, dataType: 'entity' })
      .then((metaData) => {
        const faultyPropertiesInner = validateEntityProperties(metaData?.properties as IPropertyMetadata[], axisProperty, valueProperty, groupingProperty);
        if (faultyPropertiesInner.length > 0) {
          setFaultyProperties(faultyPropertiesInner);
          isFetchingRef.current = false;
          return Promise.reject(new Error(`Faulty properties: ${faultyPropertiesInner.join(', ')}`));
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
            -1 // -1 to get all data without pagination
          );

          return refetch(params);
        });
      })
      .then((response) => {
        if (!response?.result) {
          throw new Error('Invalid response structure');
        }
        const items = response.result.items ?? [];
        
        // Process and update data
        processAndUpdateData(items, refListMap);
        setIsLoaded(true);
        setMetadataProcessed(true);
      })
      .catch((error) => {
        console.error('Error in fetchAndProcessData:', error);
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while fetching chart data';
        setError(errorMessage);
        setIsLoaded(true);
        setMetadataProcessed(false);
      })
      .finally(() => {
        isFetchingRef.current = false;
      });
  }, [entityType, valueProperty, axisProperty, groupingProperty, orderBy, orderDirection, evaluatedFilters]);

  const data: IChartData = useProcessedChartData();

  // Memoize Alert components to prevent re-renders
  const faultyPropertiesAlert = useMemo(() => {
    if (faultyProperties.length === 0) return null;

    return (
      <Alert
        showIcon
        message="Chart control properties not set correctly, some properties not matching the entity type!"
        description={descriptionMessage}
        type="warning"
      />
    );
  }, [faultyProperties.length, descriptionMessage]);

  const missingPropertiesAlert = useMemo(() => {
    if (entityType && chartType && valueProperty && axisProperty && !faultyProperties?.length) return null;

    return (
      <Alert
        showIcon
        message="Chart control properties not set correctly!"
        description={missingPropertiesInfo.descriptionMessage}
        type="warning"
      />
    );
  }, [entityType, chartType, valueProperty, axisProperty, faultyProperties?.length, missingPropertiesInfo.descriptionMessage]);

  const errorAlert = useMemo(() => {
    if (!error) return null;

    return (
      <Alert
        showIcon
        message="Error loading chart data"
        description={error}
        type="error"
      />
    );
  }, [error]);

  // Memoize the loader component
  const loaderComponent = useMemo(() => {
    if (!state.isLoaded || !metadataProcessed) {
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
    }
    return null;
  }, [state.isLoaded, metadataProcessed, chartType, cx, styles.loadingText]);

  // Early returns with memoized components
  if (error) {
    return errorAlert;
  }

  if (faultyProperties.length > 0) {
    return faultyPropertiesAlert;
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
      <div style={chartInnerStyle}>
        {renderChart(chartType, data)}
      </div>
    </div>
  );
});

ChartControl.displayName = 'ChartControl';

export default ChartControl;