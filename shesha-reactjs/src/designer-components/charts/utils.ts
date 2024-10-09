import { IChartData, IFilter, TOperator } from "./model";

/**
 * Function to get the chart data from the API
 * @param entityType entity type to get data from
 * @param dataProperty property to get data from
 * @param filters filters to apply to the data before returning
 * @param legendProperty legend property to use for the chart
 * @param axisProperty axis property to use for the chart
 * @returns getChartData mutate path and queryParams
 */
export const getChartDataRefetchParams = (entityType: string, dataProperty: string, filters: string[], legendProperty?: string, axisProperty?: string) => {
  return {
    path: `/api/services/app/Entities/GetAll`,
    queryParams: {
      entityType: entityType,
      properties: (dataProperty + (legendProperty ? ',' + legendProperty : '') + (axisProperty ? ',' + axisProperty : ''))?.replace(/(\w+)\.(\w+)/, '$1{$2}'),
      maxResultCount: 100,
      filter: Boolean(filters) ? JSON.stringify(filters) : undefined,
    },
  };
};

/**
 * Used to get the property value of an entity no matter how deep the property is nested
 * @param obj the object to get the property value from
 * @param path the path to the property
 * @returns the value of the property
 */
export function getPropertyValue(obj: { [key: string]: string | number | object }, path: string) {
  if (!path || typeof obj !== 'object') return undefined;

  const properties = path.split('.');

  return properties?.reduce((prev: { [key: string]: string | number | object }, curr: string) => {
    return prev && prev[curr] !== undefined ? prev[curr] : undefined;
  }, obj);
}

/**
 * A function that splits a string that is separated by a dot and returns the last part of the string
 * @param property the property to get the last part of
 * @returns the last part of the property
 */
export function getLastPartOfProperty(property: string) {
  // if there is no dot in the string, return the string
  if (property.indexOf('.') === -1) return property;
  return property.split('.').pop();
}

/**
 * Function to group and aggregate data
 * @param data - The data to be aggregated
 * @param xProperty - The property to group by on the x-axis
 * @param yProperty - The property to aggregate on the y-axis
 * @param aggregationMethod - The aggregation method to use (sum, average, count, min, max)
 * @returns Aggregated data
 * */
const aggregateData = (data: object[], xProperty: string, yProperty: string, aggregationMethod: string) => {
  const groupedData = data.reduce((acc: object, item: { [key: string]: string | number | object }) => {
    const xValue = getPropertyValue(item, xProperty); // Use getPropertyValue to support nested properties
    const yValue = getPropertyValue(item, yProperty) ?? 0; // Use getPropertyValue for y-axis value

    if (!acc[xValue as unknown as string]) {
      acc[xValue as unknown as string] = [];
    }
    acc[xValue as unknown as string].push(yValue);
    return acc;
  }, {});

  // Apply aggregation (sum, average, count, min, max)
  const aggregatedData = Object.entries(groupedData).map(([key, values]: any) => {
    let aggregatedValue;
    switch (aggregationMethod) {
      case 'sum':
        aggregatedValue = values.reduce((acc: number, val: number) => acc + val, 0);
        break;
      case 'average':
        aggregatedValue = values.reduce((acc: number, val: number) => acc + val, 0) / values.length;
        break;
      case 'min':
        aggregatedValue = Math.min(...values);
        break;
      case 'max':
        aggregatedValue = Math.max(...values);
        break;
      case 'count': // Count the number of items, also used as the default case
      default:
        aggregatedValue = values.length;
    }
    return { x: key, y: aggregatedValue };
  });

  return aggregatedData;
};

/**
 * Function to filter data based on a property, operator, and value
 * @param preFilteredData pre-filtered data
 * @param property the property to filter by
 * @param operator the operator to use for the filter
 * @param value the value to filter by
 * @returns filtered data
 */
export function filterData(preFilteredData: object[], property: string, operator: TOperator, value: string | number): object[] {
  if (!property || !operator || value === undefined) {
    console.error('Invalid filter: property, operator, and value are required');
    return preFilteredData;
  }
  if (!Array.isArray(preFilteredData) || preFilteredData?.length === 0) {
    console.error('Invalid data: preFilteredData must be a non-empty array');
    return [];
  }

  // Filter the data based on the operator
  return preFilteredData?.filter((item: { [key: string]: string | number | object }) => {
    const itemValue: string | number = getPropertyValue(item, property) as unknown as string | number;
    // Convert the item to a string if itemValue is a number and it is not a number
    if (typeof itemValue === 'number') {
      try {
        value = parseInt(value as string, 10);
      } catch (e) {
        console.error('Invalid value: Value must be a number');
        return false;
      }
    }

    switch (operator) {
      case 'equals':
        return itemValue === value;

      case 'not_equals':
        return itemValue !== value;

      case 'contains':
        const result = typeof itemValue === 'string' && ((itemValue as string).toLowerCase()).includes((value as unknown as string).toLowerCase());
        return result;

      case 'does_not_contain':
        return typeof itemValue === 'string' && !((itemValue as string).toLowerCase()).includes((value as unknown as string).toLowerCase());

      case 'is_empty':
        return (itemValue as unknown as string) === '' || itemValue == null;

      case 'is_not_empty':
        return (itemValue as unknown as string) !== '' && itemValue != null;

      case 'is_greater_than':
        return typeof itemValue === 'number' && itemValue > (value as number);

      case 'is_less_than':
        return typeof itemValue === 'number' && itemValue < (value as number);

      case 'is_greater_than_or_equals':
        return typeof itemValue === 'number' && itemValue >= (value as number);

      case 'is_less_than_or_equals':
        return typeof itemValue === 'number' && itemValue <= (value as number);

      case 'starts_with':
        return typeof itemValue === 'string' && (itemValue as unknown as string).startsWith(value as unknown as string);

      case 'ends_with':
        return typeof itemValue === 'string' && (itemValue as unknown as string).endsWith(value as unknown as string);

      case 'is':
        return itemValue === value;

      case 'is_not':
        return itemValue !== value;

      default:
        console.error(`Invalid operator: '${operator}' is not recognized`);
        return false;
    }
  });
};

/**
 * Apply filters to the data
 * @param data raw data
 * @param filters filters to apply
 * @returns filtered data
 */
export function applyFilters(
  data: Array<object>,
  filters: Array<IFilter>
): Array<object> {
  // Start with the unfiltered data
  let filteredData = data ? [...data] : [];

  // Apply each filter one by one
  filters?.forEach((filter) => {
    const { property, operator, value } = filter;
    filteredData = filterData(filteredData, property, operator, value);
  });

  return filteredData;
}

/**
 * from that array we need make a list of all the properties of the objects
 * @param data the data to get the properties from
 * @returns a list of all the properties
 */
export function getAllProperties(data: Array<object>): Array<string> {
  // Start with an empty array
  let properties: Array<string> = [];

  // Loop through each object in the data array
  data?.forEach((item) => {
    // Get the keys of the object and add them to the properties array
    properties = [...properties, ...Object.keys(item)];
  });

  // Return the unique properties
  return [...new Set(properties)];
}

/**
 * Function to get a predictable color based on a string or number
 * @param value the value to get the color for
 * @returns a predictable color in HSL format
 */
function getPredictableColorHSL(value: string): string {
  // Hash the string value to get a semi-random seed without bitwise operations
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    // A non-linear function to mix character codes :)
    hash += (value.charCodeAt(i) * (i + 1)) ** 3.5;  // Raising to 3.5 to exaggerate differences
  }

  // Use the hash to calculate the hue (0 - 360 degrees on the color wheel)
  const hue = Math.abs(hash % 360);

  // Set a fixed saturation and lightness for the color to ensure visibility
  const saturation = 60 + (hash % 30);  // Varies between 60% and 90% for some saturation variation
  const lightness = 57 + (hash % 20);  // Varies between 50% and 70% for lightness variation

  // Construct the HSL color string
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Replace getRandomColor with getPredictableColor
 * @param input the input to get the color for
 * @returns a predictable color in HSL format
 */
function getPredictableColor(input: string | number): string {
  if (typeof input === 'string') {
    return getPredictableColorHSL(input.toString());
  }

  // If the input is a number, convert it to a string and return the color
  return getPredictableColorHSL(input + '');
}

// Update the relevant functions to use getPredictableColor

/**
 * Prepare line chart data
 * @param data raw data
 * @param xProperty x-axis property
 * @param yProperty y-axis property
 * @param aggregationMethod aggregation method (sum, average, count, min, max)
 * @returns prepared line chart data
 */
export const prepareLineChartData = (data: object[], xProperty: string, yProperty: string, strokeColor: string, aggregationMethod = 'sum'): IChartData => {
  const aggregatedData = aggregateData(data, xProperty, yProperty, aggregationMethod);

  return {
    labels: aggregatedData.map(item => item.x),
    datasets: [
      {
        label: `${yProperty} (${aggregationMethod}) Over ${xProperty}`,
        data: aggregatedData.map(item => item.y),
        borderColor: strokeColor || 'white',
        backgroundColor: getPredictableColor(yProperty),
        fill: false,
        pointRadius: 5,
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
export const prepareBarChartData = (data: object[], xProperty: string, yProperty: string, strokeColor: string, aggregationMethod = 'sum'): IChartData => {
  const aggregatedData = aggregateData(data, xProperty, yProperty, aggregationMethod);

  return {
    labels: aggregatedData.map(item => item.x),
    datasets: [
      {
        label: `${yProperty} (${aggregationMethod}) Over ${xProperty}`,
        data: aggregatedData.map(item => item.y),
        backgroundColor: aggregatedData.map(item => getPredictableColor(item.x.toString())),
        borderColor: strokeColor || 'white',
        borderWidth: 1,
      }
    ]
  };
};

/**
 * Prepare pie chart data
 * @param data raw data
 * @param legendProperty legend property
 * @param valueProperty value property
 * @param aggregationMethod aggregation method (sum, average, count, min, max)
 * @returns prepared pie chart data
 */
export const preparePieChartData = (data: object[], legendProperty: string, valueProperty: string, strokeColor: string, aggregationMethod: string): IChartData => {
  const labels = [...new Set(data?.map((item: { [key: string]: any }) => getPropertyValue(item, legendProperty)))];

  const datasets = [{
    label: `${valueProperty} (${aggregationMethod})`,
    data: labels.map((label: string) => {
      const filteredData = data?.filter((item: { [key: string]: any }) => getPropertyValue(item, legendProperty) === label);
      const values: number[] = filteredData?.map((item: { [key: string]: any }) => getPropertyValue(item, valueProperty) as number);

      // Aggregation logic
      if (aggregationMethod === 'sum') return values.reduce((acc, val) => acc + (val || 0), 0);
      if (aggregationMethod === 'count') return values.length;
      if (aggregationMethod === 'average') return values.reduce((acc, val) => acc + (val || 0), 0) / values.length;
      if (aggregationMethod === 'min') return Math.min(...values);
      if (aggregationMethod === 'max') return Math.max(...values);
      return 0;
    }),
    backgroundColor: labels.map((label: string) => getPredictableColor(label)),
    borderColor: strokeColor || 'white',
  }];

  return {
    labels,
    datasets
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
export const preparePolarAreaChartData = (data: object[], legendProperty: string, valueProperty: string, strokeColor: string, aggregationMethod: string): IChartData => {
  const labels = [...new Set(data?.map((item: { [key: string]: any }) => getPropertyValue(item, legendProperty)))];

  const datasets = [{
    label: `${valueProperty} (${aggregationMethod})`,
    data: labels.map((label: string) => {
      const filteredData = data?.filter((item: { [key: string]: any }) => getPropertyValue(item, legendProperty) === label);
      const values: number[] = filteredData?.map((item: { [key: string]: any }) => getPropertyValue(item, valueProperty) as number);

      // Aggregation logic
      if (aggregationMethod === 'sum') return values.reduce((acc, val) => acc + (val || 0), 0);
      if (aggregationMethod === 'count') return values.length;
      if (aggregationMethod === 'average') return values.reduce((acc, val) => acc + (val || 0), 0) / values.length;
      if (aggregationMethod === 'min') return Math.min(...values);
      if (aggregationMethod === 'max') return Math.max(...values);
      return 0;
    }),
    backgroundColor: labels.map((label: string) => getPredictableColor(label)),
    borderColor: strokeColor || 'white',
  }];

  return {
    labels,
    datasets
  };
};

/**
 * Function to aggregate values based on the aggregation method
 * @param items the items to aggregate
 * @param aggregationMethod the aggregation method to use (sum, average, count, min, max)
 * @param valueProperty the property to aggregate
 * @returns the aggregated value
 */
function aggregateValues(items: object[], aggregationMethod: string, valueProperty: string): number {
  const values: number[] = items.map((item: { [key: string]: any }) => item[valueProperty]);
  switch (aggregationMethod) {
    case 'sum':
      return values.reduce((acc, val) => acc + (val || 0), 0);
    case 'count':
      return values.length;
    case 'average':
      return values.reduce((acc, val) => acc + (val || 0), 0) / values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    default:
      return 0;
  }
}

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
export const preparePivotChartData = (
  data: object[],
  axisProperty: string,
  legendProperty: string,
  valueProperty: string,
  strokeColor: string,
  aggregationMethod: string,
  chartType: string,
  refLists?: { [key: string]: any[] }
): IChartData => {
  const labels = [...new Set(data?.map((item: { [key: string]: any }) => getPropertyValue(item, axisProperty)))];
  const legendItems = [...new Set(data?.map((item: { [key: string]: any }) => item[legendProperty]))];

  const datasets = legendItems.map(legend => {
    const strLegend = typeof legend === 'string' ? legend : legend + '';
    const barBackgroundColor = getPredictableColor(strLegend);
    let colors: string[] = [];
    const legendDisplayValue = refLists?.[legendProperty]?.find((it: { itemValue: any }) => it.itemValue === legend)?.item;
    return {
      label: legendDisplayValue,
      data: labels?.map(label => {
        const matchingItems = data.filter((item: { [key: string]: any }) =>
          getPropertyValue(item, axisProperty) === label && item[legendProperty] === legend
        );
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
      borderColor: strokeColor || 'white',
      backgroundColor: colors,
      pointRadius: 5,
    };
  });

  return {
    labels: labels,
    datasets: datasets
  };
};
