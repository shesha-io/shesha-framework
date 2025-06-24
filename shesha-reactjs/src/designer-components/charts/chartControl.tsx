import { useGet } from '@/hooks';
import { useFormData, useMetadataDispatcher, useNestedPropertyMetadatAccessor } from '@/index';
import { IRefListPropertyMetadata } from '@/interfaces/metadata';
import { useFormEvaluatedFilter } from '@/providers/dataTable/filters/evaluateFilter';
import { useReferenceListDispatcher } from '@/providers/referenceListDispatcher';
import { toCamelCase } from '@/utils/string';
import { Alert, Flex, Spin, Tooltip } from 'antd';
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useChartDataActionsContext, useChartDataStateContext } from '../../providers/chartData';
import { useProcessedChartData } from './hooks';
import { IChartData, IChartsProps } from './model';
import useStyles from './styles';
import { formatDate, getChartDataRefetchParams, getResponsiveStyle, processItems, renderChart, sortItems } from './utils';
import ChartLoader from './components/chartLoader';
import { InfoCircleOutlined } from '@ant-design/icons';

const ChartControl: React.FC<IChartsProps> = (props) => {
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
  } = props;
  const { refetch } = useGet({ path: '', lazy: true });
  const state = useChartDataStateContext();
  const { getMetadata } = useMetadataDispatcher();
  const { getReferenceList } = useReferenceListDispatcher();
  const { setData, setIsLoaded, setFilterdData, setControlProps } = useChartDataActionsContext();
  const { data: formData } = useFormData();
  const [loadingProgress, setLoadingProgress] = useState<{ current: number; total: number } | null>({
    current: 0,
    total: -1,
  });
  const [showLoader, setShowLoader] = useState(true);
  const [metadataProcessed, setMetadataProcessed] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);

  const { styles, cx } = useStyles();

  useEffect(() => setControlProps(props), [props, formData]);

  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(entityType);
  const evaluatedFilters = useFormEvaluatedFilter({ metadataAccessor: propertyMetadataAccessor });

  // Memoize the required properties to avoid unnecessary re-renders
  const requiredProperties = useMemo(() => {
    if (!entityType || !valueProperty || !axisProperty) return null;
    return { entityType, valueProperty, axisProperty };
  }, [entityType, valueProperty, axisProperty]);

  // Function to process and update chart data
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
  }, [processItems, sortItems, isAxisTimeSeries, axisProperty, timeSeriesFormat, isGroupingTimeSeries, groupingTimeSeriesFormat, setData]);

  useEffect(() => {
    if (!requiredProperties || isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    const fetchAndProcessData = async () => {
      try {
        setIsLoaded(false);
        setHasInitialData(false);

        // Get metadata first to identify reference list properties
        const metaData = await getMetadata({ modelType: entityType, dataType: 'entity' });

        // Pre-filter reference list properties and create lookup maps
        const refListProperties = (metaData.properties as Array<IRefListPropertyMetadata>).filter(
          (metaItem: IRefListPropertyMetadata) => metaItem.dataType === 'reference-list-item' && (metaItem.path.toLowerCase() === axisProperty.toLowerCase() || metaItem.path.toLowerCase() === groupingProperty?.toLowerCase())
        );

        // Create reference list lookup maps in parallel
        const refListMap = new Map<string, Map<any, string>>();
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
        await Promise.all(refListPromises);

        // Mark metadata as processed
        setMetadataProcessed(true);

        // Fetch data with optimized batch size and parallel requests
        const batchSize = 1000;
        let allItems: any[] = [];
        let totalCount = 0;

        // Get first batch to determine total count
        const firstParams = getChartDataRefetchParams(
          entityType,
          valueProperty,
          evaluatedFilters,
          groupingProperty,
          axisProperty,
          filterProperties,
          orderBy,
          orderDirection,
          0,
          batchSize
        );

        const firstResponse = await refetch(firstParams);

        if (!firstResponse?.result) {
          throw new Error('Invalid response structure');
        }

        totalCount = firstResponse.result.totalCount ?? 0;
        if (firstResponse.result.items && Array.isArray(firstResponse.result.items)) {
          allItems = firstResponse.result.items;
          setLoadingProgress(prev => ({ ...prev, current: allItems.length, total: totalCount }));

          // Process and show initial data immediately
          processAndUpdateData(allItems, refListMap);
          setHasInitialData(true);
          setShowLoader(false);
        }

        // Calculate remaining batches and fetch them in parallel
        const remainingBatches = Math.ceil((totalCount - allItems.length) / batchSize);
        if (remainingBatches > 0) {
          const batchPromises = [];

          for (let i = 1; i <= remainingBatches; i++) {
            const skipCount = i * batchSize;
            const params = getChartDataRefetchParams(
              entityType,
              valueProperty,
              evaluatedFilters,
              groupingProperty,
              axisProperty,
              filterProperties,
              orderBy,
              orderDirection,
              skipCount,
              batchSize
            );

            batchPromises.push(refetch(params));
          }

          // Process each batch one by one for progressive updates
          for (const element of batchPromises) {
            const response = await element;
            if (response?.result?.items && Array.isArray(response.result.items)) {
              allItems = allItems.concat(response.result.items);
              setLoadingProgress(prev => ({ ...prev, current: allItems.length, total: totalCount }));

              // Update chart with new data as it comes in
              processAndUpdateData(allItems, refListMap);

              // Small delay to make progress visible
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          }
        }

        setIsLoaded(true);
        setLoadingProgress(null);
      } catch (error) {
        console.error('Error in fetchAndProcessData:', error);
        setIsLoaded(true);
        setShowLoader(false);
        setMetadataProcessed(false);
        setHasInitialData(false);
        setLoadingProgress({
          current: 0,
          total: -1,
        });
      } finally {
        isFetchingRef.current = false;
      }
    };

    fetchAndProcessData();
  }, [
    requiredProperties,
    evaluatedFilters,
    groupingProperty,
    isAxisTimeSeries,
    timeSeriesFormat,
    filterProperties,
    orderBy,
    orderDirection,
    formData,
    isGroupingTimeSeries,
    groupingTimeSeriesFormat,
    processAndUpdateData,
    entityType,
    valueProperty,
    axisProperty,
    getMetadata,
    getReferenceList,
    refetch,
  ]);

  useEffect(() => {
    if (state.data) {
      setFilterdData(state.data);
    }
  }, [state.data]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const data: IChartData = useProcessedChartData();

  if (!entityType || !chartType || !valueProperty || !axisProperty) {
    // Collect the missing properties in an array
    const missingProperties: string[] = [];
    if (!entityType) missingProperties.push("'entityType'");
    if (!chartType) missingProperties.push("'chartType'");
    if (!valueProperty) missingProperties.push("'valueProperty'");
    if (!axisProperty) missingProperties.push("'axisProperty'");

    // Dynamically build the description
    const descriptionMessage = `Please make sure that you've specified the following properties: ${missingProperties.join(', ')}.`;

    return (
      <Alert
        showIcon
        message="Chart control properties not set correctly!"
        description={descriptionMessage}
        type="warning"
      />
    );
  }

  // Show loader only if we don't have any data yet
  if (!hasInitialData && loadingProgress?.current !== loadingProgress?.total) {
    return (
      <>
        {loadingProgress && (!state.isLoaded || !metadataProcessed) && showLoader && (
          <Flex
            align="center"
            justify="center"
            vertical
            gap={16}
            className={cx(
              styles.responsiveChartContainer,
              props?.showBorder ? styles.chartContainerWithBorder : styles.chartContainerNoBorder
            )}
            style={getResponsiveStyle(props)}
          >
            <ChartLoader chartType={chartType} />
            <div className={cx(styles.loadingText)}>Fetching data...</div>
          </Flex>
        )}
      </>
    );
  }

  return (
    <div
      className={cx(
        styles.responsiveChartContainer,
        props?.showBorder ? styles.chartContainerWithBorder : styles.chartContainerNoBorder
      )}
      style={{
        ...getResponsiveStyle(props),
        width: '100%',
        height: '100%',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div style={{
        flex: 1,
        width: '100%',
        height: '100%',
        minHeight: '350px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {renderChart(chartType, data)}
      </div>
      {/* Show progress indicator if still loading more data */}
      {loadingProgress && hasInitialData && (loadingProgress.current !== loadingProgress.total) && (
        <Flex
          key={`progress-${loadingProgress.current}`}
          align="center"
          justify="center"
          vertical
          gap={4}
          style={{ margin: 16, flexShrink: 0 }}>
          <Spin size="small" />
          <div className={cx(styles.loadingText)}>
            <Tooltip title={`${loadingProgress.current} / ${loadingProgress.total} items fetched so far`}>
              <InfoCircleOutlined />
              <span> Fetching more data...</span>
            </Tooltip>
          </div>
        </Flex>
      )}
    </div>
  );
};

export default ChartControl;