import { useGet } from '@/hooks';
import { useFormData } from '@/index';
import { Alert, Flex } from 'antd';
import React, { useEffect, useMemo } from 'react';
import { useChartDataActionsContext, useChartDataStateContext } from '../../providers/chartData';
import { useChartURLData } from './hooks';
import { IChartsProps } from './model';
import useStyles from './styles';
import { getResponsiveStyle, getURLChartDataRefetchParams, renderChart } from './utils';
import ChartLoader from './components/chartLoader';

const ChartControlURL: React.FC<IChartsProps> = (props) => {
  const { url, chartType } = props;
  const { refetch } = useGet({ path: '', lazy: true });
  const state = useChartDataStateContext();
  const { setIsLoaded, setControlProps, setUrlTypeData } = useChartDataActionsContext();
  const { data: formData } = useFormData();

  const { styles, cx } = useStyles();
  const transformedUrl = useMemo(() => {
    if (!url) return null;
    const queryString = props.additionalProperties 
      ? '?' + props.additionalProperties.map(({ key, value }) => key + '=' + value).join('&')
      : '';
    return url + queryString;
  }, [url, props.additionalProperties]);

  useEffect(() => setControlProps(props), [props, formData]);
  useEffect(() => {
    if (!transformedUrl || transformedUrl === '') {
      return;
    }
    refetch(getURLChartDataRefetchParams(transformedUrl))
      .then((data) => {
        setUrlTypeData(data?.result ?? { labels: [], datasets: [] });
        setIsLoaded(true);
      })
      .catch((err: any) => console.error('refetch getURLChartDataRefetchParams, err data', err))
      .finally(() => setIsLoaded(true));
  }, [transformedUrl]);

  const memoUrlTypeData = useChartURLData();

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
      <Flex
        align="center"
        justify="center"
        className={cx(
          styles.responsiveChartContainer,
          props?.showBorder ? styles.chartContainerWithBorder : styles.chartContainerNoBorder
        )}
        style={getResponsiveStyle(props)}
      >
        <ChartLoader chartType={chartType} />
        <div className={cx(styles.loadingText)}>Loading data...</div>
      </Flex>
    );
  }

  if (!state.urlTypeData || state.urlTypeData?.labels?.length === 0 || state.urlTypeData?.datasets?.length === 0 || memoUrlTypeData.datasets.length === 0 || memoUrlTypeData.labels.length === 0) {
    return (
      <Alert
        showIcon
        message="No data to display!"
        description="Please check the URL and try again."
        type="warning"
      />
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
        {renderChart(chartType, memoUrlTypeData)}
      </div>
    </div>
  );
};

export default ChartControlURL;
