import { useGet } from '@/hooks';
import { Alert, Button, Flex } from 'antd';
import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useChartDataActionsContext, useChartDataStateContext } from '../../providers/chartData';
import { useChartURLData } from './hooks';
import { IChartsProps } from './model';
import useStyles from './styles';
import { getURLChartDataRefetchParams, renderChart } from './utils';
import ChartLoader from './components/chartLoader';

const ChartControlURL: React.FC<IChartsProps> = (props) => {
  const { url, chartType } = props;
  const { refetch } = useGet({ path: '', lazy: true });
  const state = useChartDataStateContext();
  const { setIsLoaded, setUrlTypeData } = useChartDataActionsContext();

  // Add error handling state similar to chartControl.tsx
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const { styles, cx } = useStyles();
  const transformedUrl = useMemo(() => {
    if (!url) return null;
    const queryString = props.additionalProperties 
      ? '?' + props.additionalProperties.map(({ key, value }) => key + '=' + value).join('&')
      : '';
    return url + queryString;
  }, [url, props.additionalProperties]);

  const fetchData = useCallback(() => {
    if (isFetchingRef.current || !transformedUrl || transformedUrl === '') {
      return;
    }

    // Clear any previous errors
    setError(null);
    isFetchingRef.current = true;

    refetch(getURLChartDataRefetchParams(transformedUrl))
      .then((data) => {
        if (!data?.result) {
          throw new Error(data?.error?.details ?? 'Invalid response structure');
        }
        setUrlTypeData(data.result ?? { labels: [], datasets: [] });
        setIsLoaded(true);
      })
      .catch((err: any) => {
        console.error('Error fetching URL chart data:', err);
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching chart data from URL';
        setError(errorMessage);
        setIsLoaded(true);
      })
      .finally(() => {
        isFetchingRef.current = false;
      });
  }, [transformedUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const memoUrlTypeData = useChartURLData();

  // Memoize missing properties check to prevent unnecessary re-renders
  const missingPropertiesInfo = useMemo(() => {
    const missingProperties: string[] = [];
    if (!url) missingProperties.push("'url'");
    if (!chartType) missingProperties.push("'chartType'");

    return {
      hasMissingProperties: missingProperties.length > 0,
      descriptionMessage: `Please make sure that you've specified the following properties: ${missingProperties.join(', ')}.`
    };
  }, [url, chartType]);

  // Memoize Alert components to prevent re-renders
  const missingPropertiesAlert = useMemo(() => {
    if (url && chartType) return null;

    return (
      <Alert
        showIcon
        message="Chart control properties not set correctly!"
        description={missingPropertiesInfo.descriptionMessage}
        type="warning"
      />
    );
  }, [url, chartType, missingPropertiesInfo.descriptionMessage]);

  const errorAlert = useMemo(() => {
    if (!error) return null;

    return (
      <Alert
        showIcon
        message="Error loading chart data from URL"
        description={error}
        type="error"
        action={
          <Button type="primary" onClick={() => {
            fetchData();
          }}>
            Retry
          </Button>
        }
      />
    );
  }, [error, fetchData]);

  const noDataAlert = useMemo(() => {
    if (state.urlTypeData?.labels?.length > 0 && state.urlTypeData?.datasets?.length > 0 && 
        memoUrlTypeData.datasets.length > 0 && memoUrlTypeData.labels.length > 0) {
      return null;
    }

    return (
      <Alert
        showIcon
        message="No data to display!"
        description="Please check the URL and try again."
        type="warning"
      />
    );
  }, [state.urlTypeData, memoUrlTypeData]);

  // Memoize the loader component
  const loaderComponent = useMemo(() => {
    if (!state.isLoaded) {
      return (
        <Flex
          align="center"
          justify="center"
          vertical
          gap={16}
        >
          <ChartLoader chartType={chartType} />
          <div className={cx(styles.loadingText)}>Loading data...</div>
        </Flex>
      );
    }
    return null;
  }, [state.isLoaded, chartType, cx, styles.loadingText]);

  // Memoize chart container styles to prevent unnecessary re-renders
  const chartContainerStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0
  }), []);

  const chartInnerStyle = useMemo(() => ({
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0
  }), []);

  // Early returns with memoized components
  if (error) {
    return errorAlert;
  }

  if (!url || !chartType) {
    return missingPropertiesAlert;
  }

  if (!state.isLoaded) {
    return loaderComponent;
  }

  if (!state.urlTypeData || state.urlTypeData?.labels?.length === 0 || state.urlTypeData?.datasets?.length === 0 || 
      memoUrlTypeData.datasets.length === 0 || memoUrlTypeData.labels.length === 0) {
    return noDataAlert;
  }

  return (
    <div style={chartContainerStyle}>
      <div style={chartInnerStyle}>
        {renderChart(chartType, memoUrlTypeData)}
      </div>
    </div>
  );
};

export default ChartControlURL;
