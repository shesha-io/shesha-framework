import { useGet } from '@/hooks';
import { useFormData } from '@/index';
import { LoadingOutlined } from '@ant-design/icons';
import { Alert, Flex, Result, Spin } from 'antd';
import React, { useEffect } from 'react';
import { useChartDataActionsContext, useChartDataStateContext } from '../../providers/chartData';
import { useChartURLData } from './hooks';
import { IChartsProps } from './model';
import useStyles from './styles';
import { getURLChartDataRefetchParams, renderChart } from './utils';

const ChartControlURL: React.FC<IChartsProps> = (props) => {
  const { url, chartType } = props;
  const { refetch } = useGet({ path: '', lazy: true });
  const state = useChartDataStateContext();
  const { setIsLoaded, setControlProps, setUrlTypeData } = useChartDataActionsContext();
  const { data: formData } = useFormData();

  const { styles, cx } = useStyles();

  useEffect(() => {
    setControlProps({
      ...props
    });
  }, [props, formData]);

  useEffect(() => {
    if (!url) {
      return;
    }
    refetch(getURLChartDataRefetchParams(url))
      .then((data) => {
        if (!data.result) {
          setIsLoaded(true);
          throw new Error('No data returned from the server. Please check the URL and try again.');
        }
        if (!data.result.datasets || !data.result.labels) {
          var errors: string[] = [];
          if (!data.result.datasets) {
            errors.push('No datasets returned from the server. Please check the URL and try again.');
          }
          if (!data.result.labels) {
            errors.push('No labels returned from the server. Please check the URL and try again.');
          }
          throw new Error(errors.join(' '));
        }
        setUrlTypeData(data.result);
        setIsLoaded(true);
      })
      .catch((err: any) => console.error('refetch getURLChartDataRefetchParams, err data', err))
      .finally(() => setIsLoaded(true));
  }, [url, formData]);

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
      <Flex align="center" justify='center'>
        <Spin indicator={<LoadingOutlined className={cx(styles.chartControlSpinFontSize)} spin />} />
      </Flex>
    );
  }

  if (!state.urlTypeData) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="Sorry, no data to display. Please check the URL and try again."
      />
    );
  }

  return (
    <Flex align='center' justify='center' className={cx(styles.chartControlContainer)} style={{
      height: props?.height > 200 ? props.height : 'auto',
      width: props?.width > 300 ? props.width : 'auto',
      border: props?.showBorder ? '1px solid #ddd' : 'none'
    }}>
      {renderChart(chartType, memoUrlTypeData)}
    </Flex>
  );
};

export default ChartControlURL;
