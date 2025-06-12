import { useGet } from '@/hooks';
import { useFormData, useMetadataDispatcher, useNestedPropertyMetadatAccessor } from '@/index';
import { IRefListPropertyMetadata } from '@/interfaces/metadata';
import { useFormEvaluatedFilter } from '@/providers/dataTable/filters/evaluateFilter';
import { useReferenceListDispatcher } from '@/providers/referenceListDispatcher';
import { toCamelCase } from '@/utils/string';
import { LoadingOutlined } from '@ant-design/icons';
import { Alert, Flex, Result, Spin } from 'antd';
import React, { useEffect, useMemo } from 'react';
import { useChartDataActionsContext, useChartDataStateContext } from '../../providers/chartData';
import BarChart from './components/bar';
import LineChart from './components/line';
import PieChart from './components/pie';
import PolarAreaChart from './components/polarArea';
import { useProcessedChartData } from "./hooks";
import { IChartData, IChartsProps } from './model';
import useStyles from './styles';
import { formatDate, getChartDataRefetchParams } from './utils';

const ChartControl: React.FC<IChartsProps> = (props) => {
  const { chartType, entityType, valueProperty, filters, legendProperty,
    axisProperty, filterProperties, allowFilter, 
    isAxisTimeSeries, timeSeriesFormat, orderBy, orderDirection
  } = props;
  const { refetch } = useGet({ path: '', lazy: true });
  const state = useChartDataStateContext();
  const { getMetadata } = useMetadataDispatcher();
  const { getReferenceList } = useReferenceListDispatcher();
  const { setData, setIsLoaded, setFilterdData, setControlProps } = useChartDataActionsContext();
  const { data: formData } = useFormData();

  const { styles, cx } = useStyles();

  useEffect(() => {
    setControlProps({
      ...props
    });
  }, [props, formData]);

  const memoFilters = useMemo(() => filters, [filters, formData]);

  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(entityType);
  const evaluatedFilters = useFormEvaluatedFilter({ filter: memoFilters, metadataAccessor: propertyMetadataAccessor });
  useEffect(() => {
    if (!entityType || !valueProperty || !axisProperty) {
      return;
    }
    refetch(getChartDataRefetchParams(entityType, valueProperty, evaluatedFilters, legendProperty, axisProperty, filterProperties, orderBy, orderDirection))
      .then((data) => {
        data.result.items = data?.result?.items?.map((item: { [key: string]: any }) => {
          for (const key in item) {
            if (item[key] === null || item[key] === undefined) {
              item[key] = 'undefined';
            }
          }
          return item;
        });
        return data;
      })
      .then((data) => {
        if (isAxisTimeSeries) {
          data.result.items = data?.result?.items?.sort((a: { [key: string]: any }, b: { [key: string]: any }) => new Date(a[axisProperty]).getTime() - new Date(b[axisProperty]).getTime());
        } else {
          data.result.items = data?.result?.items?.sort((a: { [key: string]: any }, b: { [key: string]: any }) => a[axisProperty] - b[axisProperty]);
        }
        return data;
      })
      .then((data) => {
        data.result.items = formatDate(data.result.items, timeSeriesFormat, [axisProperty]);
        return data;
      })
      .then((data) => {
        getMetadata({ modelType: entityType, dataType: 'entity' }).then((metaData) => {
          const refListPromises = (metaData.properties as Array<IRefListPropertyMetadata>)
            .filter((metaItem: IRefListPropertyMetadata) => metaItem.dataType === 'reference-list-item')
            .map((metaItem: IRefListPropertyMetadata) => {
              const fieldName = toCamelCase(metaItem.path);
              return getReferenceList({ refListId: { module: metaItem.referenceListModule, name: metaItem.referenceListName } })
              .promise
              .then((refListItem) => {
                data.result?.items?.forEach((item: any) => {
                  if (item[fieldName] !== undefined) {
                    const referenceName = refListItem.items.find((x) => x.itemValue === item[fieldName])?.item;
                    item[fieldName] = referenceName?.trim() || `${item[fieldName]}`;
                  }
                });
              })
              .catch((err: any) => console.error('getReferenceList, err metadata', err));
            });

            Promise.all(refListPromises).then(() => setData(data.result.items));
        });
      })
      .then(() => setIsLoaded(true))
      .catch((err: any) => console.error('getChartDataRefetchParams, err data', err));
  }, [entityType, valueProperty, evaluatedFilters, legendProperty, axisProperty, isAxisTimeSeries, timeSeriesFormat, filterProperties, orderBy, orderDirection, formData]);

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
      <Flex align="center" justify='center'>
        <Spin indicator={<LoadingOutlined className={cx(styles.chartControlSpinFontSize)} spin />} />
      </Flex>
    );
  }

  const getResponsiveStyle = () => {
    if (allowFilter) return {};
    
    return {
      // Responsive height with fallbacks
      height: props?.height 
        ? `min(${props.height}px, 80vh)` // Use provided height but cap at 80% viewport height
        : 'clamp(300px, 50vh, 600px)',   // Responsive height between 300px and 600px
      
      // Responsive width with fallbacks  
      width: props?.width 
        ? `min(${props.width}px, 95vw)`  // Use provided width but cap at 95% viewport width
        : 'clamp(300px, 90vw, 100%)',   // Responsive width between 300px and 800px
    };
  };

  return (
      <div 
        className={cx(
          styles.responsiveChartContainer,
          props?.showBorder ? styles.chartContainerWithBorder : styles.chartContainerNoBorder
        )}
        style={getResponsiveStyle()}
      >
      {
        (() => {
          switch (chartType) {
            case 'line':
              return <LineChart data={data} />;
            case 'bar':
              return <BarChart data={data} />;
            case 'pie':
              return <PieChart data={data} />;
            case 'polarArea':
              return <PolarAreaChart data={data} />;
            default:
              return <Result status="404" title="404" subTitle="Sorry, please select a chart type." />;
          }
        })()
      }
      </div>
  );
};

export default ChartControl;
