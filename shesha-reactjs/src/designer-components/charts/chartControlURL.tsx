import { useGet } from '@/hooks';
import { Alert, Button } from 'antd';
import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { useChartDataActionsContext, useChartDataStateContext } from '../../providers/chartData';
import { useChartURLData } from './hooks/hooks';
import { IChartsProps } from './model';
import useStyles from './styles';
import { getURLChartDataRefetchParams, renderChart } from './utils';
import ChartLoader from './components/chartLoader';
import { useTheme } from '@/providers/theme';
import { IAjaxResponse } from '@/interfaces';
import { isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';

const ChartControlURL: React.FC<IChartsProps> = (props) => {
  const { url, chartType, requestTimeout = 5000 } = props;
  const { refetch } = useGet<IAjaxResponse<object>>({ path: '', lazy: true });
  const state = useChartDataStateContext();
  const { setIsLoaded, setUrlTypeData } = useChartDataActionsContext();
  const { theme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);
  const currentControllerRef = useRef<AbortController | null>(null);

  const { styles, cx } = useStyles();
  const transformedUrl = useMemo(() => {
    if (!url) return null;
    const queryString = props.additionalProperties
      ? '?' + props.additionalProperties.map(({ key, value }) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      ).join('&')
      : '';
    return url + queryString;
  }, [url, props.additionalProperties]);

  const fetchData = useCallback(() => {
    // Early return if already fetching or missing required URL
    if (isFetchingRef.current || !transformedUrl || transformedUrl === '') {
      return;
    }

    const newController = new AbortController();
    currentControllerRef.current = newController;

    // Set up timeout (configurable, default 5 seconds)
    const timeoutId = setTimeout(() => {
      if (currentControllerRef.current) {
        currentControllerRef.current.abort("Request timed out");
        isFetchingRef.current = false;
        setError(`Request timed out after ${requestTimeout / 1000} seconds`);
        setIsLoaded(true);
      }
    }, requestTimeout);

    // Clear any previous errors
    setError(null);
    isFetchingRef.current = true;

    refetch({ ...getURLChartDataRefetchParams(transformedUrl), signal: newController.signal })
      .then((response) => {
        if (!isAjaxSuccessResponse(response))
          throw new Error(response.error.details ?? 'Invalid response structure, please check the URL and try again.');

        setUrlTypeData(response.result ?? { labels: [], datasets: [] });
        setIsLoaded(true);
      })
      .catch((err: Error) => {
        console.error('Error fetching URL chart data:', err);

        // Check if this is an intentional abort (reset, unmount, user cancellation, or component initialization)
        const abortMessage = err?.message || '';
        const isIntentionalAbort = abortMessage.includes('Resetting chart') ||
          abortMessage.includes('Unmounting chart') ||
          abortMessage.includes('Request cancelled by user') ||
          abortMessage.includes('Component initialization');

        if (err?.name === 'AbortError' && isIntentionalAbort) {
          // Don't set error for intentional aborts - just clean up
          isFetchingRef.current = false;
          return;
        }

        // Check if it's a timeout error
        const isTimeoutError = err?.name === 'AbortError' && err?.message?.includes('timeout');

        const altErrorMessage = err instanceof Error ? err.message : 'An error occurred while fetching chart data from URL';
        const errorMessage = isTimeoutError
          ? `Request timed out after ${requestTimeout / 1000} seconds`
          : altErrorMessage;
        setError(errorMessage);
        setIsLoaded(true);
      })
      .finally(() => {
        isFetchingRef.current = false;
        clearTimeout(timeoutId);
      });
  }, [transformedUrl, requestTimeout, refetch, setUrlTypeData, setIsLoaded, setError]);

  useEffect(() => {
    // Only fetch data if URL is properly configured
    if (!transformedUrl || transformedUrl === '') {
      // If missing URL, just set loaded state without fetching
      setIsLoaded(true);
      setError(null);
      return;
    }

    // Reset loading state when chart properties change
    setIsLoaded(false);
    setError(null);

    fetchData();
  }, [transformedUrl, requestTimeout]);

  // Cleanup effect to abort requests on unmount
  useEffect(() => {
    return () => {
      if (currentControllerRef.current && isFetchingRef.current) {
        try {
          currentControllerRef.current.abort("Unmounting chart");
        } catch {
          // Ignore abort errors during unmount - this is expected behavior
        }
      }
    };
  }, []);

  const memoUrlTypeData = useChartURLData();

  // Memoize missing properties check to prevent unnecessary re-renders
  const missingPropertiesInfo = useMemo(() => {
    const missingProperties: string[] = [];
    if (!url) missingProperties.push("'url'");
    if (!chartType) missingProperties.push("'chartType'");

    return {
      hasMissingProperties: missingProperties.length > 0,
      descriptionMessage: `Please make sure that you've specified the following properties: ${missingProperties.join(', ')}.`,
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

    const isUserCancelled = error === 'Request cancelled by user';
    const isTimeoutError = error.includes('Request timed out after');

    return (
      <Alert
        showIcon
        message={isUserCancelled ? "Request cancelled" : isTimeoutError ? "Request timed out" : "Error loading chart data from URL"}
        description={error}
        type={isUserCancelled ? "info" : isTimeoutError ? "warning" : "error"}
        action={(
          <Button
            color="danger"
            onClick={() => {
              fetchData();
            }}
          >
            Retry
          </Button>
        )}
      />
    );
  }, [error, theme.application.errorColor]);

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
        <div className={cx(styles.loadingContainer)}>
          <ChartLoader
            chartType={chartType}
            handleCancelClick={() => {
              if (isFetchingRef.current && currentControllerRef.current) {
                try {
                  currentControllerRef.current.abort("Request cancelled by user");
                } catch {
                  // Ignore abort errors during user cancellation - this is expected behavior
                }
                isFetchingRef.current = false;
                setError('Request cancelled by user');
                setIsLoaded(true);
              }
            }}
          />
          <div className={cx(styles.loadingText)}>Loading data...</div>
        </div>
      );
    }
    return null;
  }, [state.isLoaded, chartType, cx, styles.loadingContainer, styles.loadingText, setIsLoaded]);

  // Memoize chart container styles to prevent unnecessary re-renders
  const chartContainerStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
    overflow: 'hidden',
  }), []);

  const chartInnerStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
    overflow: 'hidden',
  }), []);

  const hasValidData = useMemo(() => {
    return state.urlTypeData?.labels?.length > 0 && state.urlTypeData?.datasets?.length > 0 &&
      memoUrlTypeData.datasets.length > 0 && memoUrlTypeData.labels.length > 0;
  }, [state.urlTypeData, memoUrlTypeData]);

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

  if (!hasValidData) {
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
