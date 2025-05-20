import { TAggregationMethod, TOperator, TOrderDirection, TTimeSeriesFormat } from "./model";

/**
 * Function to stringify values in an array of objects
 * @param data array of objects to stringify values
 * @returns array of objects with stringified values
 */
export const stringifyValues = (data: object[]) => {
  return data.map(item => {
    for (const key in item) {
      if (typeof item[key] !== 'string') {
        item[key] = `${item[key]}`;
      }
    }
    return item;
  });
};

/**
 * @param str the enjoined properties string to remove duplicates from
 * @returns the string without duplicates
 */
function removePropertyDuplicates(str) {
  // Split the string into an array by commas
  const arr = str.split(',');

  // Use a Set to remove duplicates and convert it back to an array
  const uniqueArr = [...new Set(arr)];

  // Join the array back into a string
  return uniqueArr.join(',');
}

/**
 * Function to convert an array of nested properties to object format
 * @example convertNestedPropertiesToObjectFormat(['a.b.c', 'a.b.d', 'a.e']) => 'a { b { c }, a { b { d }, a { e }'
 * @param array array of nested properties
 * @returns the array in object format
 */
function convertNestedPropertiesToObjectFormat(array?: string[]) {
  if (!array) return '';

  return array?.filter(path => path && path?.trim() !== '').map(path => {
    let parts = path.split('.');
    let result = '';
    let indentation = 0;

    if (parts.length === 1) {
      // If there's no nesting (no dots), return the part directly
      return parts[0];
    }

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        result += `${''.repeat(indentation)}${part}`;
      } else {
        result += `${''.repeat(indentation)}${part} {\n`;
        indentation += 2;
      }
    });

    result += `${''.repeat(indentation - 2)} }`.repeat(parts.length - 1); // closing brackets
    return result;
  }).join(', ');
}

/**
 * Function to get the chart data from the API
 * @param entityType entity type to get data from
 * @param dataProperty property to get data from
 * @param filters filters to apply to the data before returning
 * @param legendProperty legend property to use for the chart
 * @param axisProperty axis property to use for the chart
 * @param filterProperties properties to filter on (not the same as shesha filters)
 * @returns getChartData mutate path and queryParams
 */
export const getChartDataRefetchParams = (entityType: string, dataProperty: string, filters: string, legendProperty?: string, axisProperty?: string, filterProperties?: string[], orderBy?: string, orderDirection?: TOrderDirection) => {
  return {
    path: `/api/services/app/Entities/GetAll`,
    queryParams: {
      entityType: entityType,
      properties: removePropertyDuplicates((convertNestedPropertiesToObjectFormat([dataProperty, legendProperty, axisProperty]) + ", " + convertNestedPropertiesToObjectFormat(filterProperties)).replace(/\s/g, '')),
      filter: filters,
      sorting: orderBy ? `${orderBy} ${orderDirection ?? 'asc'}` : '',
    },
  };
};


export const getURLChartDataRefetchParams = (url: string) => {
  return {
    path: url ? `${url}` : '',
  };
};

/**
 * Used to get the property value of an entity no matter how deep the property is nested
 * @param obj the object to get the property value from
 * @param path the path to the property
 * @returns the value of the property
 */
export function getPropertyValue(obj: { [key: string]: string | number | object }, path: string) {
  if (obj === null) return null;
  if (obj === undefined) return undefined;
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
 * Function to check if a value is an ISO string  
 * - An ISO string is a string that matches the ISO 8601 format
 * - Example: '2021-08-25T12:00:00.000Z'
 * - The format is 'YYYY-MM-DDTHH:MM:SS.sssZ'
 * - The milliseconds and Z are optional
 * @param value the value to check
 * @returns true if the value is an ISO string, false otherwise
 */
function isIsoString(value) {
  // Check if value is a string and matches the ISO 8601 format (with optional milliseconds)
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?/.test(value);
}

/**
 * Function to format the date based on the time unit
 * @param data the data to format
 * @param timeUnit the time unit to format the date to
 * @param properties the properties to format
 * @returns the formatted data
 */
export function formatDate(data, timeUnit: TTimeSeriesFormat, properties: string[]) {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return data?.map(item => {
    let modifiedItem = { ...item };

    properties.forEach(property => {
      if (item[property] && isIsoString(item[property])) {
        const date = new Date(item[property]);

        let formattedDate;
        switch (timeUnit) {
          case 'day':
            formattedDate = date.getDate();
            break;
          case 'month':
            formattedDate = monthNames[date.getMonth()]; // Month name
            break;
          case 'year':
            formattedDate = date.getFullYear();
            break;
          case 'day-month':
            formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]}`; // Day + Month name
            break;
          case 'day-month-year':
            formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`; // Day + Month name + Year
            break;
          case 'month-year':
            formattedDate = `${monthNames[date.getMonth()]} ${date.getFullYear()}`; // Month name + Year
            break;
          default:
            formattedDate = date.toISOString();
            break;
        }
        modifiedItem[property] = formattedDate;
      }
    });

    return modifiedItem;
  });
}

/**
 * Function to group and aggregate data
 * @param data - The data to be aggregated
 * @param xProperty - The property to group by on the x-axis
 * @param yProperty - The property to aggregate on the y-axis
 * @param aggregationMethod - The aggregation method to use (sum, average, count, min, max)
 * @returns Aggregated data
 * */
export const aggregateData = (data: object[], xProperty: string, yProperty: string, aggregationMethod: string) => {
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
  const aggregatedData = Object.entries(groupedData)?.map(([key, values]: any) => {
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
    console.error('filterData, Invalid filter: property, operator, and value are required');
    return preFilteredData;
  }
  if (!Array.isArray(preFilteredData) || preFilteredData?.length === 0) {
    console.error('filterData, Invalid data: preFilteredData must be a non-empty array');
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
        console.error('filterData, Invalid value: Value must be a number', e);
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
        console.error(`filterData, Invalid operator: '${operator}' is not recognized`);
        return false;
    }
  });
};

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

  // Set a fixed alpha for transparency
  const alpha = 0.75;  // 25% transparency

  // Construct the HSLA color string
  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
}

/**
 * Replace getRandomColor with getPredictableColor
 * @param input the input to get the color for
 * @returns a predictable color in HSL format
 */
export function getPredictableColor(input: string | number): string {
  if (typeof input === 'string') {
    switch (input.toLocaleLowerCase()) {
      case 'true':
        return 'hsla(120, 100%, 20%, 0.75)';
      case 'false':
        return 'hsla(0, 100%, 20%, 0.75)';
      case 'unknown':
        return 'hsla(0, 0%, 50%, 0.75)';
      case 'undefined':
        return 'hsla(0, 0%, 20%, 0.75)';
      case 'null':
        return 'hsla(0, 100%, 20%, 0.75)';
      case '':
        return 'hsla(240, 100%, 20%, 0.75)';
      case 'none':
        return 'hsla(0, 0%, 75%, 0.75)';
      case 'not disclosed':
        return 'hsla(20, 20%, 90%, 0.75)';
      default:
        return getPredictableColorHSL(input.toString());
    }
  }

  // If the input is a number, convert it to a string and return the color
  return getPredictableColorHSL(input + '');
}

/**
 * Function to aggregate values based on the aggregation method
 * @param items the items to aggregate
 * @param aggregationMethod the aggregation method to use (sum, average, count, min, max)
 * @param valueProperty the property to aggregate
 * @returns the aggregated value
 */
export function aggregateValues(items: object[], aggregationMethod: TAggregationMethod, valueProperty: string): number {
  const values: number[] = items?.map((item: { [key: string]: any }) => item[valueProperty]);
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
