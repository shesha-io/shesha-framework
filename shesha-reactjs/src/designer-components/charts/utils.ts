import { IChartData, IFilter, TOperator } from "./model";

export const getChartData = (entityType: string, dataProperty: string, filters: string[], legendProperty?: string, axisProperty?: string) => {
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
 * Used to get the fully qualified path for the metadata of an entity type
 */
export const getEntityMetaData = (entityType: string) => {
  let queryParams = {
    container: entityType
  };
  return {
    path: `/api/services/app/Metadata/Get`,
    queryParams
  };
};

/**
 * Used to get the properties of a reference list
 */
export const getRefListValues = (refListName: string) => {
  let queryParams = {
    entityType: 'Shesha.Framework.ReferenceListItem',
    filter: '{"and":[{"==":[{"var":"referenceList.isLast"},true]}]}',
    quickSearch: refListName
  };
  return {
    path: `/api/services/app/Entities/GetAll`,
    queryParams: queryParams,
  };
};

/**
 * Used to get the property value of an entity no matter how deep the property is nested
 */
export function getPropertyValue(obj: { [key: string]: string | number | object }, path: string) {
  if (!path || typeof obj !== 'object') return undefined;

  const properties = path.split('.');

  return properties?.reduce((prev: { [key: string]: string | number | object }, curr: string) => {
    return prev && prev[curr] !== undefined ? prev[curr] : undefined;
  }, obj);
}

// a function that splits a string that is separated by a dot and returns the last part of the string
export function getLastPartOfProperty(property: string) {
  // if there is no dot in the string, return the string
  if (property.indexOf('.') === -1) return property;
  return property.split('.').pop();
}

const getRandomColor = () => {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgb(${r}, ${g}, ${b})`;
};

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

// Prepare function for line chart data with aggregation
export const prepareLineChartData = (data: object[], xProperty: string, yProperty: string, aggregationMethod = 'sum') => {
  const aggregatedData = aggregateData(data, xProperty, yProperty, aggregationMethod);

  return {
    labels: aggregatedData.map(item => item.x), // X-axis labels
    datasets: [
      {
        label: `${yProperty} (${aggregationMethod}) Over ${xProperty}`, // Legend label
        data: aggregatedData.map(item => item.y), // Y-axis data
        borderColor: 'white',
        backgroundColor: aggregatedData.map(() => getRandomColor()), // Fill color below the line
        fill: false,
        // tension: 0.4 // Smooth the line
        pointRadius: 5,
      }
    ]
  };
};

// Prepare function for bar chart data with aggregation
export const prepareBarChartData = (data: object[], xProperty: string, yProperty: string, aggregationMethod = 'sum'): IChartData => {
  const aggregatedData = aggregateData(data, xProperty, yProperty, aggregationMethod);

  return {
    labels: aggregatedData.map(item => item.x), // X-axis labels
    datasets: [
      {
        label: `${yProperty} (${aggregationMethod}) Over ${xProperty}`, // Legend label
        data: aggregatedData.map(item => item.y), // Y-axis data
        backgroundColor: aggregatedData.map(() => getRandomColor()), // Bar color
        borderColor: 'white',
        borderWidth: 1,
      }
    ]
  };
};

// Prepare pie chart data dynamically
export const preparePieChartData = (data: object[], legendProperty: string, valueProperty: string, aggregationMethod: string) => {
  const labels = [...new Set(data?.map((item: { [key: string]: string | number | object }) => getPropertyValue(item, legendProperty)))];

  const datasets = [{
    label: `${valueProperty} (${aggregationMethod})`,
    data: labels.map((label: string) => {
      const filteredData = data?.filter((item: { [key: string]: string | number | object }) => getPropertyValue(item, legendProperty) === label);
      const values: any[] = filteredData?.map((item: { [key: string]: string | number | object }) => getPropertyValue(item, valueProperty));

      // Aggregation logic
      if (aggregationMethod === 'sum') return values.reduce((acc: number, val: number) => acc + (val || 0), 0);
      if (aggregationMethod === 'count') return values.length;
      if (aggregationMethod === 'average') return values.reduce((acc: number, val: number) => acc + (val || 0), 0) / values.length;
      if (aggregationMethod === 'min') return Math.min(...values);
      if (aggregationMethod === 'max') return Math.max(...values);
      return 0;
    }),
    backgroundColor: labels.map(() => getRandomColor()),
    borderColor: 'white',
  }];

  return {
    labels,
    datasets
  };
};

export const preparePivotChartData = (data: object[], axisProperty: string, legendProperty: string, valueProperty: string, aggregationMethod: string, chartType, refLists?: { [key: string]: any[] }) => {
  // axisProperty: can be a dot separated string like 'organisation.name', so we need to extract both the object and property
  const labels = [...new Set(data?.map((item: { [key: string]: string | number | object }) => {
    return getPropertyValue(item, axisProperty);
  }))];  // Unique axis labels
  const legendItems = [...new Set(data?.map((item: object) => item[legendProperty]))];  // Unique legend items

  // Helper function to calculate based on aggregation type
  const aggregateValues = (items: object[], aggregationMethod: string) => {
    const values = items?.map((item: object) => item[valueProperty]);
    switch (aggregationMethod) {
      case 'sum':
        return values.reduce((acc: number, val: number) => acc + val, 0);
      case 'count':
        return values.length;
      case 'average':
        return values.reduce((acc: number, val: number) => acc + val, 0) / values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      default:
        return 0;  // Default to 0 if no aggregation matches
    }
  };

  const backgroundColors = labels.map(() => getRandomColor());
  const datasets = legendItems.map(legend => {
    const barBackgroundColors = getRandomColor();
    let colors: string[] = [];
    const legendDisplayValue = refLists[legendProperty]?.find((it: { itemValue }) => it.itemValue === legend)?.item;
    return {
      label: legendDisplayValue,  // The label for the legend (series)
      data: labels?.map(label => {
        const matchingItems = data.filter((item: { [key: string]: string | number | object }) => getPropertyValue(item, axisProperty) === label && item[legendProperty] === legend);
        switch (chartType) {
          case 'bar':
          case 'line':
            colors.push(barBackgroundColors);
            break;
          default:
            colors.push(...backgroundColors);
            break;
        }
        return matchingItems.length > 0 ? aggregateValues(matchingItems, aggregationMethod) : 0;
      }),
      fill: false,
      borderColor: 'white',
      backgroundColor: colors,
      pointRadius: 5,
    };
  });

  return {
    labels: labels,
    datasets: datasets
  };
};

export function filterData(preFilteredData: object[], property: string, operator: TOperator, value: string | number): object[] {
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
        const result = typeof itemValue === 'string' && (itemValue as string).includes(value as unknown as string);
        return result;

      case 'does_not_contain':
        return typeof itemValue === 'string' && !(itemValue as string).includes(value as unknown as string);

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

// from that array we need make a list of all the properties of the objects
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
