import { useChartDataStateContext } from "@/providers";

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
