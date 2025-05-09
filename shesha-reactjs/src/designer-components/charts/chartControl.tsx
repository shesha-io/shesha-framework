import ConditionalWrap from '@/components/conditionalWrapper';
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
    axisProperty, simpleOrPivot, filterProperties, allowFilter, 
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

  const lineChartData = useProcessedChartData();
  const barChartData = useProcessedChartData();
  const pieOrPolarAreaChartData = useProcessedChartData();
  const pivotChartData = useProcessedChartData();

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

  let data: IChartData;

  if (!state.isLoaded) {
    return (
      <Flex align="center" justify='center'>
        <Spin indicator={<LoadingOutlined className={cx(styles.chartControlSpinFontSize)} spin />} />
      </Flex>
    );
  }

  const wrapperDiv = (children: React.ReactNode) => (
    <div className={cx(styles.chartControlContainer)} style={{
      height: props?.height > 200 ? props.height : 'auto',
      width: props?.width > 300 ? props.width : 'auto',
      border: props?.showBorder ? '1px solid #ddd' : 'none'
    }}>
      {children}
    </div>
  );

  return (
    <ConditionalWrap
      condition={allowFilter}
      wrap={(children) => wrapperDiv(children)}
    >
      <Flex align='center' justify='center' className={!allowFilter && cx(styles.chartControlContainer)} style={!allowFilter && {
        height: props?.height > 200 ? props.height : 'auto',
        width: props?.width > 300 ? props.width : 'auto',
        border: props?.showBorder ? '1px solid #ddd' : 'none'
      }}>
      {
        (() => {
          switch (chartType) {
            case 'line':
              data = simpleOrPivot === 'simple'
                ? lineChartData
                : pivotChartData;
              return <LineChart data={data} />;
            case 'bar':
              data = simpleOrPivot === 'simple'
                ? barChartData
                : pivotChartData;
              return <BarChart data={data} />;
            case 'pie':
              data = simpleOrPivot === 'simple'
                ? pieOrPolarAreaChartData
                : pivotChartData;
              return <PieChart data={data} />;
            case 'polarArea':
              data = simpleOrPivot === 'simple'
                ? pieOrPolarAreaChartData
                : pivotChartData;
              return <PolarAreaChart data={data} />;
            default:
              return <Result status="404" title="404" subTitle="Sorry, please select a chart type." />;
          }
        })()
      }
      </Flex>
    </ConditionalWrap>
  );
};

export default ChartControl;
