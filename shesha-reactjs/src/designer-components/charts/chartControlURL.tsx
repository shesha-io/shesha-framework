import { useGet } from '@/hooks';
import { useFormData } from '@/index';
import { LoadingOutlined } from '@ant-design/icons';
import { Alert, Flex, Result, Spin } from 'antd';
import React, { useEffect } from 'react';
import { useChartDataActionsContext, useChartDataStateContext } from '../../providers/chartData';
import BarChart from './components/bar';
import LineChart from './components/line';
import PieChart from './components/pie';
import PolarAreaChart from './components/polarArea';
import { IChartsProps } from './model';
import useStyles from './styles';
import { getURLChartDataRefetchParams } from './utils';

const ChartControlURL: React.FC<IChartsProps> = (props) => {
  const { url, chartType, entityType, valueProperty, filters, legendProperty,
    axisProperty, showLegend, showTitle, title, legendPosition, showXAxisScale,
    showXAxisTitle, showYAxisScale, showYAxisTitle, simpleOrPivot,
    filterProperties, stacked, tension, strokeColor, allowFilter, isAxisTimeSeries,
    timeSeriesFormat } = props;
  const { refetch } = useGet({ path: '', lazy: true });
  const state = useChartDataStateContext();
  const { setIsLoaded, setControlProps, setUrlTypeData } = useChartDataActionsContext();
  const { data: formData } = useFormData();

  const { styles, cx } = useStyles();

  useEffect(() => {
    setControlProps({
      valueProperty, legendProperty, axisProperty, showLegend, showTitle, title, legendPosition, showXAxisScale, showXAxisTitle,
      showYAxisScale, showYAxisTitle, simpleOrPivot, stacked, tension, strokeColor, allowFilter,
      isAxisTimeSeries, timeSeriesFormat, url
    });
  }, [valueProperty, legendProperty, axisProperty, showLegend, showTitle, title, legendPosition, showXAxisScale, showXAxisTitle,
    showYAxisScale, showYAxisTitle, simpleOrPivot, stacked, tension, strokeColor, allowFilter,
    isAxisTimeSeries, timeSeriesFormat, url, formData]);

  useEffect(() => {
    refetch(getURLChartDataRefetchParams(url))
      .then((data) => {
        if (!data.result) {
          setIsLoaded(true);
          return;
        }
        data.result?.datasets?.map((dataset: any) => {
          dataset.borderColor = strokeColor || 'white';
          dataset.fill = false;
          dataset.pointRadius = 5;
          dataset.borderWidth = 0.5;
          return dataset;
        });
        setUrlTypeData(data.result);
        setIsLoaded(true);
      })
      .catch((err: any) => console.error('refetch getURLChartDataRefetchParams, err data', err));
  }, [chartType, entityType, valueProperty, filters, legendProperty, axisProperty, filterProperties, isAxisTimeSeries,
    timeSeriesFormat, showTitle, showLegend, legendPosition, showXAxisScale, showXAxisTitle, showYAxisScale, showYAxisTitle,
    stacked, tension, strokeColor, url, formData]);

  if (!url || !chartType) {
    const missingProperties: string[] = [];
    if (!url) missingProperties.push("'url'");
    if (!chartType) missingProperties.push("'chartType'");

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

  return (
    <div className={cx(styles.chartControlContainer)}>
      {
        (() => {
          switch (chartType) {
            case 'line':
              return <LineChart data={state.urlTypeData as any} />;
            case 'bar':
              return <BarChart data={state.urlTypeData as any} />;
            case 'pie':
              return <PieChart data={state.urlTypeData as any} />;
            case 'polarArea':
              return <PolarAreaChart data={state.urlTypeData as any} />;
            default:
              return <Result status="404" title="404" subTitle="Sorry, please select a valid chart type." />;
          }
        })()
      }
    </div>
  );
};

export default ChartControlURL;
