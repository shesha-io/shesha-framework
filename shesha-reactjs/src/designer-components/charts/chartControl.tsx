import { useGet } from '@/hooks';
import { useFormData, useMetadataDispatcher, useNestedPropertyMetadatAccessor } from '@/index';
import { IRefListPropertyMetadata } from '@/interfaces/metadata';
import { useFormEvaluatedFilter } from '@/providers/dataTable/filters/evaluateFilter';
import { useReferenceListDispatcher } from '@/providers/referenceListDispatcher';
import { toCamelCase } from '@/utils/string';
import { LoadingOutlined } from '@ant-design/icons';
import { Alert, Flex, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
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
  const [loadingProgress, setLoadingProgress] = useState<{ current: number; total: number } | null>(null);

  const { styles, cx } = useStyles();

  useEffect(() => setControlProps(props), [props, formData]);

  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(entityType);
  const evaluatedFilters = useFormEvaluatedFilter({ metadataAccessor: propertyMetadataAccessor });
  useEffect(() => {
    if (!entityType || !valueProperty || !axisProperty) {
      return;
    }

    const fetchAndProcessData = async () => {
      try {
        setIsLoaded(false);
        setLoadingProgress(null);

        let allItems: any[] = [];
        let currentSkipCount = 0;
        const batchSize = 1000;
        let totalCount = 0;
        let isFirstRequest = true;

        // Keep fetching until we have all items
        while (isFirstRequest || allItems.length < totalCount) {
          const params = getChartDataRefetchParams(
            entityType, 
            valueProperty, 
            evaluatedFilters, 
            groupingProperty, 
            axisProperty, 
            filterProperties, 
            orderBy, 
            orderDirection,
            currentSkipCount,
            batchSize
          );

          const response = await refetch(params);
          
          if (response?.result) {
            // On first request, capture the total count
            if (isFirstRequest) {
              totalCount = response.result.totalCount || 0;
              isFirstRequest = false;
            }

            // Add the items from this batch
            if (response.result.items && Array.isArray(response.result.items)) {
              allItems = [...allItems, ...response.result.items];
              
              // Update loading progress
              setLoadingProgress({ current: allItems.length, total: totalCount });
            }

            // Move to next batch
            currentSkipCount += batchSize;

            // Safety check: if we didn't get any items, break to avoid infinite loop
            if (!response.result.items || response.result.items.length === 0) {
              break;
            }
          } else {
            console.error('Invalid response structure:', response);
            break;
          }
        }

        // Process null/undefined values
        let processedItems = allItems.map((item: { [key: string]: any }) => {
          const processedItem = { ...item };
          for (const key in processedItem) {
            if (processedItem[key] === null || processedItem[key] === undefined) {
              processedItem[key] = 'undefined';
            }
          }
          return processedItem;
        });

        // Sort items
        if (isAxisTimeSeries) {
          processedItems = processedItems.sort((a: { [key: string]: any }, b: { [key: string]: any }) => 
            new Date(a[axisProperty]).getTime() - new Date(b[axisProperty]).getTime()
          );
        } else {
          processedItems = processedItems.sort((a: { [key: string]: any }, b: { [key: string]: any }) => {
            const aVal = a[axisProperty];
            const bVal = b[axisProperty];
            
            // Handle numeric values
            if (typeof aVal === 'number' && typeof bVal === 'number') {
              return aVal - bVal;
            }
            
            // Handle string values
            return String(aVal).localeCompare(String(bVal));
          });
        }

        // Format dates
        processedItems = formatDate(processedItems, timeSeriesFormat, [axisProperty]);
        if (isGroupingTimeSeries) {
          processedItems = formatDate(processedItems, groupingTimeSeriesFormat, [groupingProperty]);
        }

        // Get metadata and process reference lists
        const metaData = await getMetadata({ modelType: entityType, dataType: 'entity' });
        
        const refListPromises = (metaData.properties as Array<IRefListPropertyMetadata>)
          .filter((metaItem: IRefListPropertyMetadata) => metaItem.dataType === 'reference-list-item')
          .map((metaItem: IRefListPropertyMetadata) => {
            const fieldName = toCamelCase(metaItem.path);
            return getReferenceList({ 
              refListId: { 
                module: metaItem.referenceListModule, 
                name: metaItem.referenceListName 
              } 
            })
            .promise
            .then((refListItem) => {
              processedItems.forEach((item: any) => {
                if (item[fieldName] !== undefined) {
                  const referenceName = refListItem.items.find((x) => x.itemValue === item[fieldName])?.item;
                  item[fieldName] = referenceName?.trim() || `${item[fieldName]}`;
                }
              });
            })
            .catch((err: any) => console.error('getReferenceList, err metadata', err));
          });

        await Promise.all(refListPromises);
        
        setData(processedItems);
        setIsLoaded(true);
        setLoadingProgress(null);
      } catch (error) {
        console.error('Error in fetchAndProcessData:', error);
        setIsLoaded(true);
        setLoadingProgress(null);
      }
    };

    fetchAndProcessData();
  }, [entityType, valueProperty, evaluatedFilters, groupingProperty, axisProperty, isAxisTimeSeries, timeSeriesFormat, filterProperties, orderBy, orderDirection, formData, isGroupingTimeSeries, groupingTimeSeriesFormat]);

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
    
    if (!state.isLoaded) {
      return (
        <Flex align="center" justify='center' vertical gap={16}>
          <Spin indicator={<LoadingOutlined className={cx(styles.chartControlSpinFontSize)} spin />} />
          {loadingProgress && (
            <div style={{ textAlign: 'center' }}>
              <div>Loading data...</div>
              <div>{loadingProgress.current} / {loadingProgress.total} items</div>
            </div>
          )}
        </Flex>
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
