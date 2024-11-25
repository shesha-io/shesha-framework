import { useChartDataStateContext } from "@/providers";
import { useMemo } from "react";
import { IChartData } from "./model";
import { aggregateData, aggregateValues, getPredictableColor, getPropertyValue, stringifyValues } from "./utils";

/**
 * Create title for the chart based on the chart type
 * @listens chartType chart type
 * @listens dataMode data mode
 * @listens xProperty x-axis property
 * @listens yProperty y-axis property
 * @listens aggregationMethod aggregation method
 * @listens legendProperty legend property
 * @listens entityType entity type
 * @listens title title
 * @returns title for the chart
 */
export const useGeneratedTitle = (): string => {
  const { axisProperty: xProperty, valueProperty: yProperty, aggregationMethod, title, legendProperty, dataMode, entityType, chartType } = useChartDataStateContext();
  
  const entityTypeArray = dataMode === 'entityType' ? entityType?.split('.') : undefined;
  const entityClassName = dataMode === 'entityType' ? entityTypeArray[entityTypeArray?.length - 1] : '';
  switch (chartType) {
    case 'bar':
    case 'line':
      return dataMode === 'entityType' ?
        (title?.trim().length > 0 ? title : `${entityClassName}: ${xProperty} vs ${yProperty} (${aggregationMethod})${legendProperty ? `, grouped by ${legendProperty}` : ''}`) :
        (title?.trim().length > 0 ? title : ``);
    case 'polarArea':
    case 'pie':
      return dataMode === 'entityType' ?
        (title?.trim().length > 0 ? title : `${entityClassName}: ${xProperty} by ${yProperty} (${aggregationMethod})`) :
        (title?.trim().length > 0 ? title : ``);
    default:
      return '';
  }
};

/**
 * Prepare line chart data
 * @param data raw data
 * @param xProperty x-axis property
 * @param yProperty y-axis property
 * @param aggregationMethod aggregation method (sum, average, count, min, max)
 * @returns prepared line chart data
 */
export const useLineChartData = (): IChartData => {
  const {
    filteredData: data, xProperty, yProperty, aggregationMethod, strokeColor, strokeWidth
  } = useChartDataStateContext();
  const memoData = useMemo(() => stringifyValues(data), [data]);
  const aggregatedData = aggregateData(memoData, xProperty, yProperty, aggregationMethod);

  return {
    labels: aggregatedData?.map(item => item.x),
    datasets: [
      {
        label: `${yProperty} (${aggregationMethod}) Over ${xProperty}`,
        data: aggregatedData?.map(item => item.y),
        borderColor: strokeColor || 'fff',
        backgroundColor: getPredictableColor(yProperty),
        fill: false,
        pointRadius: 5,
        borderWidth: typeof (strokeWidth) === 'number' ? strokeWidth : 0,
      }
    ]
  };
};

/**
 * Prepare bar chart data
 * @param data raw data
 * @param xProperty x-axis property
 * @param yProperty y-axis property
 * @param aggregationMethod aggregation method (sum, average, count, min, max)
 * @returns prepared bar chart data
 */
export const useBarChartData = (): IChartData => {
  const {
    filteredData: data, xProperty, yProperty, aggregationMethod, strokeColor, strokeWidth
  } = useChartDataStateContext();
  const memoData = useMemo(() => stringifyValues(data), [data]);
  const aggregatedData = aggregateData(memoData, xProperty, yProperty, aggregationMethod);

  return {
    labels: aggregatedData?.map(item => item.x),
    datasets: [
      {
        label: `${yProperty} (${aggregationMethod}) Over ${xProperty}`,
        data: aggregatedData?.map(item => item.y),
        backgroundColor: aggregatedData?.map(item => getPredictableColor(item.x.toString())),
        borderColor: strokeColor || 'fff',
        borderWidth: typeof (strokeWidth) === 'number' ? strokeWidth : 0
      }
    ]
  };
};

/**
 * prepare polar area chart data
 * @param data raw data
 * @param legendProperty legend property
 * @param valueProperty value property
 * @param strokeColor stroke color
 * @param aggregationMethod aggregation method (sum, average, count, min, max)
 * @returns prepared polar area chart data
 */
export const usePieOrPolarAreaChartData = (): IChartData => {
  const {
    filteredData: data, legendProperty, valueProperty, aggregationMethod, strokeColor, strokeWidth
  } = useChartDataStateContext();
  const memoData = useMemo(() => stringifyValues(data), [data]);
  const labels = [...new Set(memoData?.map((item: { [key: string]: any }) => getPropertyValue(item, legendProperty)))];

  const datasets = [{
    label: `${valueProperty} (${aggregationMethod})`,
    data: labels?.map((label: string) => {
      const filteredData = memoData?.filter((item: { [key: string]: any }) => getPropertyValue(item, legendProperty) === label);
      const values: number[] = filteredData?.map((item: { [key: string]: any }) => getPropertyValue(item, valueProperty) as number);

      // Aggregation logic
      if (aggregationMethod === 'sum') return values.reduce((acc, val) => acc + (val || 0), 0);
      if (aggregationMethod === 'count') return values.length;
      if (aggregationMethod === 'average') return values.reduce((acc, val) => acc + (val || 0), 0) / values.length;
      if (aggregationMethod === 'min') return Math.min(...values);
      if (aggregationMethod === 'max') return Math.max(...values);
      return 0;
    }),
    backgroundColor: labels?.map((label: string) => getPredictableColor(label)),
    borderColor: strokeColor || 'fff',
    borderWidth: typeof (strokeWidth) === 'number' ? strokeWidth : 0,
  }];

  return {
    labels,
    datasets
  };
};

/**
 * Prepare pivot chart data
 * @param data raw data
 * @param axisProperty axis property
 * @param legendProperty legend property
 * @param valueProperty value property
 * @param aggregationMethod aggregation method (sum, average, count, min, max)
 * @param chartType chart type (bar, line, pie)
 * @param refLists reference lists for the legend property
 * @returns prepared pivot chart data
 */
export const usePivotChartData = (): IChartData => {
  const {
    filteredData: data, axisProperty, legendProperty, valueProperty, strokeColor, aggregationMethod, chartType, strokeWidth, tension
  } = useChartDataStateContext();
  const memoData = useMemo(() => stringifyValues(data), [data]);
  var labels = [...new Set(memoData?.map((item: { [key: string]: any }) => getPropertyValue(item, axisProperty)))];
  const legendItems = [...new Set(memoData?.map((item: { [key: string]: any }) => getPropertyValue(item, legendProperty)))];

  var datasets = legendItems?.map(legend => {
    const strLegend = typeof legend === 'string' ? legend : legend + '';
    const barBackgroundColor = getPredictableColor(strLegend);
    let colors: string[] = [];
    const legendDisplayValue = legend;
    return {
      label: legendDisplayValue,
      data: labels?.map(label => {
        const matchingItems = memoData.filter((item: { [key: string]: any }) => {
          return getPropertyValue(item, axisProperty) === label && getPropertyValue(item, legendProperty) === legend;
        });
        switch (chartType) {
          case 'bar':
          case 'line':
            colors.push(barBackgroundColor);
            break;
          default:
            const strLabel = typeof label === 'string' ? label : legend + '';
            colors.push(getPredictableColor(strLabel));
            break;
        }
        return matchingItems.length > 0 ? aggregateValues(matchingItems, aggregationMethod, valueProperty) : 0;
      }),
      fill: false,
      borderColor: strokeColor || 'fff',
      backgroundColor: colors,
      pointRadius: 5,
      borderWidth: typeof (strokeWidth) === 'number' ? strokeWidth : 0,
      tension: typeof (tension) === 'number' ? tension : 0.0
    };
  });

  // Ensure dataset labels and data labels are not null or undefined
  datasets = datasets?.map((dataset) => ({
    ...dataset,
    label: dataset.label ?? 'null',
  }));

  labels = labels?.map((label) => label ?? 'null');

  return {
    labels,
    datasets,
  };
};

/**
 * Prepare chart data from URL
 * @returns prepared chart data from URL
 */
export const useChartURLData = () => {
  const {
    urlTypeData, strokeColor, strokeWidth, tension
  } = useChartDataStateContext();

  return {
    labels: urlTypeData?.labels,
    datasets: urlTypeData?.datasets?.map((dataset: any) => {
      dataset.borderColor = strokeColor || 'black';
      dataset.borderWidth = typeof (strokeWidth) === 'number' || strokeWidth > 1 ? strokeWidth : 1;
      dataset.strokeColor = strokeColor || 'black';
      dataset.tension = typeof (tension) === 'number' ? tension : 0.0;

      return dataset;
    })
  };;
};