import { useChartDataStateContext } from '@/providers';
import { useEffect, useState, useMemo } from 'react';
import { IChartData } from './model';
import { aggregateValues, getPredictableColor, getPropertyValue, stringifyValues } from './utils';

export const useIsSmallScreen = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== 'undefined' && window.innerWidth <= 480
  );

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 480);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isSmallScreen;
};


/**
 * Create title for the chart based on the chart type
 * @listens chartType chart type
 * @listens dataMode data mode
 * @listens xProperty x-axis property
 * @listens yProperty y-axis property
 * @listens aggregationMethod aggregation method
 * @listens groupingProperty legend property
 * @listens entityType entity type
 * @listens title title
 * @returns title for the chart
 */
export const useGeneratedTitle = (): string => {
  const {
    axisProperty: xProperty,
    valueProperty: yProperty,
    aggregationMethod,
    title,
    groupingProperty,
    dataMode,
    entityType,
    simpleOrPivot,
  } = useChartDataStateContext();

  const entityTypeArray = dataMode === 'entityType' && entityType ? entityType?.split('.') : [];
  const entityClassName = dataMode === 'entityType' ? entityTypeArray[entityTypeArray?.length - 1] : '';
  return dataMode === 'entityType'
    ? title?.trim().length > 0
      ? title
      : `${entityClassName}: ${xProperty} vs ${yProperty} (${aggregationMethod})${groupingProperty && simpleOrPivot === 'pivot' ? `, grouped by ${groupingProperty}` : ''}`
    : title?.trim().length > 0
      ? title
      : ``;
};

/**
 * Prepare pivot chart data
 * @param data raw data
 * @param axisProperty axis property
 * @param groupingProperty legend property
 * @param valueProperty value property
 * @param aggregationMethod aggregation method (sum, average, count, min, max)
 * @param chartType chart type (bar, line, pie)
 * @param refLists reference lists for the legend property
 * @returns prepared pivot chart data
 */
export const useProcessedChartData = (): IChartData => {
  const {
    data,
    axisProperty,
    groupingProperty,
    valueProperty,
    strokeColor,
    aggregationMethod,
    chartType,
    strokeWidth,
    tension,
    simpleOrPivot,
  } = useChartDataStateContext();
  const memoData = useMemo(() => stringifyValues(data ?? []), [data]);
  let labels = memoData.length
    ? [...new Set(memoData.map((item: { [key: string]: any }) => getPropertyValue(item, axisProperty)))]
    : [];
  let datasets = [];

  if (simpleOrPivot === 'simple' || !groupingProperty) {
    // Generate different colors for each data point based on the label
    const colors = labels.map((label) => getPredictableColor(typeof label === 'string' ? label : label + ''));

    datasets = [
      {
        label: `${valueProperty} (${aggregationMethod})`,
        data: labels?.map((label) => {
          const matchingItems = memoData.filter((item: { [key: string]: any }) => {
            return getPropertyValue(item, axisProperty) === label;
          });
          return matchingItems.length > 0 ? aggregateValues(matchingItems, aggregationMethod, valueProperty) : 0;
        }),
        fill: false,
        borderColor: strokeColor || '#fff',
        backgroundColor: colors,
        pointRadius: 5,
        borderWidth: typeof strokeWidth === 'number' ? strokeWidth : 0,
        tension: typeof tension === 'number' ? tension : 0.0,
      },
    ];
  } else {
    // Pivot mode - multiple datasets based on legend property
    const legendItems = [
      ...new Set(memoData?.map((item: { [key: string]: any }) => getPropertyValue(item, groupingProperty))),
    ];

    datasets = legendItems?.map((legend) => {
      const strLegend = typeof legend === 'string' ? legend : legend + '';
      const barBackgroundColor = getPredictableColor(strLegend);
      let colors: string[] = [];
      const legendDisplayValue = legend;
      return {
        label: legendDisplayValue,
        data: labels?.map((label) => {
          const matchingItems = memoData.filter((item: { [key: string]: any }) => {
            return getPropertyValue(item, axisProperty) === label && getPropertyValue(item, groupingProperty) === legend;
          });
          switch (chartType) {
            case 'bar':
            case 'line':
              colors.push(barBackgroundColor);
              break;
            default:
              const strLabel = typeof label === 'string' ? label : label + '';
              colors.push(getPredictableColor(strLabel));
              break;
          }
          return matchingItems.length > 0 ? aggregateValues(matchingItems, aggregationMethod, valueProperty) : 0;
        }),
        fill: false,
        borderColor: (simpleOrPivot === 'pivot' && chartType === 'line') ? getPredictableColor(strLegend) : strokeColor ?? '#000000',
        backgroundColor: colors,
        pointRadius: 5,
        borderWidth: typeof strokeWidth === 'number' ? strokeWidth : 1,
        tension: typeof tension === 'number' ? tension : 0.0,
      };
    });
  }

  // Ensure dataset labels and data labels are not null or undefined
  datasets = datasets?.map((dataset) => ({
    ...dataset,
    label: dataset.label ?? 'null',
  }));

  labels = labels?.map((label) => label ?? 'null');

  return {
    labels: labels ?? [],
    datasets: datasets ?? [],
  };
};

/**
 * Prepare chart data from URL
 * @returns prepared chart data from URL
 */
export const useChartURLData = () => {
  const { urlTypeData, strokeColor, strokeWidth, tension } = useChartDataStateContext();

  return {
    labels: urlTypeData?.labels ?? [],
    datasets: (urlTypeData?.datasets ?? []).map((dataset: any) => {
      dataset.borderColor = strokeColor || 'black';
      dataset.borderWidth = typeof strokeWidth === 'number' && strokeWidth > 1 ? strokeWidth : 1;
      dataset.strokeColor = strokeColor || 'black';
      dataset.tension = typeof tension === 'number' ? tension : 0.0;

      return dataset;
    }),
  };
};
