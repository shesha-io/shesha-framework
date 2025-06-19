import { useGet } from '@/hooks';
import { useFormData, useMetadataDispatcher, useNestedPropertyMetadatAccessor } from '@/index';
import { IRefListPropertyMetadata } from '@/interfaces/metadata';
import { useFormEvaluatedFilter } from '@/providers/dataTable/filters/evaluateFilter';
import { useReferenceListDispatcher } from '@/providers/referenceListDispatcher';
import { toCamelCase } from '@/utils/string';
import { Alert, Flex } from 'antd';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useChartDataActionsContext, useChartDataStateContext } from '../../providers/chartData';
import { useProcessedChartData } from "./hooks";
import { IChartData, IChartsProps } from './model';
import useStyles from './styles';
import { formatDate, getChartDataRefetchParams, getResponsiveStyle, renderChart } from './utils';

const ChartControl: React.FC<IChartsProps> = (props) => {
  const { chartType, entityType, valueProperty, groupingProperty,
    axisProperty, filterProperties, isAxisTimeSeries, timeSeriesFormat,
    orderBy, orderDirection, isGroupingTimeSeries, groupingTimeSeriesFormat
  } = props;
  const { refetch } = useGet({ path: '', lazy: true });
  const state = useChartDataStateContext();
  const { getMetadata } = useMetadataDispatcher();
  const { getReferenceList } = useReferenceListDispatcher();
  const { setData, setIsLoaded, setFilterdData, setControlProps } = useChartDataActionsContext();
  const { data: formData } = useFormData();
  const [loadingProgress, setLoadingProgress] = useState<{ current: number; total: number } | null>({
    current: 0,
    total: -1
  });

  const { styles, cx } = useStyles();

  useEffect(() => setControlProps(props), [props, formData]);

  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(entityType);
  const evaluatedFilters = useFormEvaluatedFilter({ metadataAccessor: propertyMetadataAccessor });

  // Memoize the required properties to avoid unnecessary re-renders
  const requiredProperties = useMemo(() => {
    if (!entityType || !valueProperty || !axisProperty) return null;
    return { entityType, valueProperty, axisProperty };
  }, [entityType, valueProperty, axisProperty]);

  // Optimized data processing function
  const processItems = useCallback((items: any[], refListMap: Map<string, Map<any, string>>) => {
    const processedItems = new Array(items.length);
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const processedItem: any = {};
      
      // Process all properties in a single pass
      for (const key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
          let value = item[key];
          
          // Handle null/undefined values
          value ??= 'undefined';
          
          // Apply reference list mapping if available
          if (refListMap.has(key)) {
            const refMap = refListMap.get(key)!;
            value = refMap.get(value) || value;
          }
          
          processedItem[key] = value;
        }
      }
      
      processedItems[i] = processedItem;
    }
    
    return processedItems;
  }, []);

  // Optimized sorting function
  const sortItems = useCallback((items: any[], isTimeSeries: boolean, property: string) => {
    if (isTimeSeries) {
      return items.sort((a, b) => {
        const aTime = new Date(a[property]).getTime();
        const bTime = new Date(b[property]).getTime();
        return aTime - bTime;
      });
    } else {
      return items.sort((a, b) => {
        const aVal = a[property];
        const bVal = b[property];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return aVal - bVal;
        }
        
        return String(aVal).localeCompare(String(bVal));
      });
    }
  }, []);

  useEffect(() => {
    if (!requiredProperties) {
      return;
    }

    const fetchAndProcessData = async () => {
      try {
        setIsLoaded(false);

        // Get metadata first to identify reference list properties
        const metaData = await getMetadata({ modelType: entityType, dataType: 'entity' });
        
        // Pre-filter reference list properties and create lookup maps
        const refListProperties = (metaData.properties as Array<IRefListPropertyMetadata>)
          .filter((metaItem: IRefListPropertyMetadata) => metaItem.dataType === 'reference-list-item');
        
        // Create reference list lookup maps in parallel
        const refListMap = new Map<string, Map<any, string>>();
        const refListPromises = refListProperties.map(async (metaItem: IRefListPropertyMetadata) => {
          const fieldName = toCamelCase(metaItem.path);
          try {
            const refListItem = await getReferenceList({ 
              refListId: { 
                module: metaItem.referenceListModule, 
                name: metaItem.referenceListName 
              } 
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

        totalCount = firstResponse.result.totalCount || 0;
        if (firstResponse.result.items && Array.isArray(firstResponse.result.items)) {
          allItems = firstResponse.result.items;
          setLoadingProgress({ current: allItems.length, total: totalCount });
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
            
            // Create promise that updates progress when resolved
            const batchPromise = refetch(params).then((response) => {
              if (response?.result?.items && Array.isArray(response.result.items)) {
                allItems = allItems.concat(response.result.items);
                setLoadingProgress({ current: allItems.length, total: totalCount });
              }
              return response;
            });
            
            batchPromises.push(batchPromise);
          }

          // Wait for all batches to complete
          await Promise.all(batchPromises);
        }

        // Process all items efficiently
        let processedItems = processItems(allItems, refListMap);

        // Sort items
        processedItems = sortItems(processedItems, isAxisTimeSeries, axisProperty);

        // Format dates
        processedItems = formatDate(processedItems, timeSeriesFormat, [axisProperty]);
        if (isGroupingTimeSeries) {
          processedItems = formatDate(processedItems, groupingTimeSeriesFormat, [groupingProperty]);
        }
        
        setData(processedItems);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error in fetchAndProcessData:', error);
        setIsLoaded(true);
        setLoadingProgress({
          current: 0,
          total: -1
        });
      }
    };

    fetchAndProcessData();
  }, [requiredProperties, evaluatedFilters, groupingProperty, isAxisTimeSeries, timeSeriesFormat, 
    filterProperties, orderBy, orderDirection, formData, isGroupingTimeSeries, groupingTimeSeriesFormat, 
    processItems, sortItems, entityType, valueProperty, axisProperty, getMetadata, getReferenceList, refetch]);

  useEffect(() => {
    if (state.data) {
      setFilterdData(state.data);
    }
  }, [state.data]);

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
    
    if (loadingProgress?.current !== loadingProgress?.total) {
      return (
        <>
          {loadingProgress && !state.isLoaded && (
            <Flex align="center" justify='center' vertical gap={16}>
              <div className={cx(styles.octagonalLoader)}></div>
              <div className={cx(styles.loadingText)}>Loading data...</div>
              <div>{loadingProgress.current} / {loadingProgress.total} items</div>
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
          style={getResponsiveStyle(props)}
        >
        {renderChart(chartType, data)}
        </div>
    );
    };
    
    export default ChartControl;
