import React from "react";
import { IChartData, IChartsProps, TAggregationMethod, TDataMode, TOperator, TOrderDirection, TTimeSeriesFormat } from "./model";
import LineChart from "./components/line";
import BarChart from "./components/bar";
import PieChart from "./components/pie";
import PolarAreaChart from "./components/polarArea";
import { Result } from "antd";
import { IPropertyMetadata, IStyleType } from "@/interfaces";

export const MAX_TITLE_LINE_LENGTH = 12;

export const defaultStyles = (): IStyleType => {
    return {
        background: { type: 'color', color: '#fff' },
        font: { weight: '400', size: 14, color: '#000', type: 'Segoe UI' },
        border: {
            border: {
                all: { width: '1px', style: 'solid', color: '#d9d9d9' },
                top: { width: '1px', style: 'solid', color: '#d9d9d9' },
                bottom: { width: '1px', style: 'solid', color: '#d9d9d9' },
                left: { width: '1px', style: 'solid', color: '#d9d9d9' },
                right: { width: '1px', style: 'solid', color: '#d9d9d9' },
            },
            radius: { all: 8, topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
            borderType: 'all',
            radiusType: 'all'
        },
        dimensions: { width: '100%', height: '400px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' }
    };
};

/**
 * Make sure the properties are valid for the entity type
 * @param metaData - The metadata of the entity type
 * @param axisProperty - The property to use for the axis
 * @param valueProperty - The property to use for the value
 * @returns An array of faulty properties by name e.g. ['axisProperty', 'groupingProperty', 'valueProperty']
 */
export const validateEntityProperties = (metaData: IPropertyMetadata[], axisProperty: string | null, valueProperty: string | null, groupingProperty: string | null) => {
  const faultyProperties: string[] = [];
  
  if (!metaData.some((property: IPropertyMetadata) => property.path?.toLowerCase() === axisProperty?.split('.')[0]?.toLowerCase())) {
    faultyProperties.push(`'axisProperty'`);
  }
  if (!metaData.some((property: IPropertyMetadata) => property.path?.toLowerCase() === valueProperty?.split('.')[0]?.toLowerCase())) {
    faultyProperties.push(`'valueProperty'`);
  }
  if (groupingProperty && !metaData.some((property: IPropertyMetadata) => property.path?.toLowerCase() === groupingProperty?.split('.')[0]?.toLowerCase())) {
    faultyProperties.push(`'groupingProperty'`);
  }
  return faultyProperties;
};

// Optimized data processing function
export const processItems = (items: any[], refListMap: Map<string, Map<any, string>>) => {
    const processedItems = new Array(items.length);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const processedItem: any = {};

      // Process all properties in a single pass
      for (const key in item) {
        if (Object.hasOwn(item, key)) {
          let value = item[key];

          // Handle null/undefined values
          value ??= 'undefined';

          // Apply reference list mapping if available
          if (refListMap.has(key)) {
            const refMap = refListMap.get(key);
            value = refMap.get(value) || value;
          }

          processedItem[key] = value;
        }
      }

      processedItems[i] = processedItem;
    }

    return processedItems;
  };

  // Optimized sorting function
export const sortItems = (items: any[], isTimeSeries: boolean, property: string) => {
    if (isTimeSeries) {
      return items.sort((a, b) => {
        const aTime = new Date(a[property]).getTime();
        const bTime = new Date(b[property]).getTime();
        return aTime - bTime;
      });
    } else {
      return items.sort((a, b) => {
        const aVal = a[property];
        const bVal = b[property];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return aVal - bVal;
        }

        return String(aVal).localeCompare(String(bVal));
      });
    }
  };

/**
 * Function to manage the length of the title, ie if the title is too long, we need to split it into multiple lines
 * @param title the title to manage
 * @returns the managed title
 */
export const splitTitleIntoLines = (title: string, lineWordLength: number = MAX_TITLE_LINE_LENGTH, lineCount: number = 5): string | string[] => {
  const words = title?.split(' ') ?? [];
  const lines = [];
  let currentLine = '';

  if (words?.length < lineWordLength) {
    return title;
  }

  for (const word of words) {
    if (currentLine?.split(' ').length < lineWordLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (lines.length === lineCount) {
        lines.push("...");
        return lines;
      }
      lines.push(currentLine);
      currentLine = '';
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
};

/**
 * Function to generate the responsive style for the chart
 * @param props.height the height of the chart
 * @param props.width the width of the chart
 * @returns the responsive style
 */
export const getResponsiveStyle = (props: IChartsProps) => {
  // Check if we're on a small screen (iPhone SE width is 375px)
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 480;
  
  return {
    // Responsive height with better mobile support
    height: props?.height 
      ? `${props.height}px`
      : isSmallScreen 
        ? 'clamp(300px, 60vh, 600px)'  // Better mobile height utilization
        : 'clamp(400px, 70vh, 800px)', // Better desktop height utilization
    
    // Responsive width - use full available space
    width: props?.width 
      ? `${props.width}px`
      : '100%', // Use full width available
    
    // Additional responsive optimizations
    minHeight: isSmallScreen ? '300px' : '400px',
    maxHeight: isSmallScreen ? '600px' : '800px'
  };
};

/**
 * Filter out null and undefined values from an object
 * @param obj the object to filter
 * @returns the filtered object
 */
export function filterNonNull<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined)
  ) as Partial<T>;
}

export const renderChart = (chartType: string, data: IChartData) => {
  switch (chartType) {
    case 'line':
      return <LineChart data={data} />;
    case 'bar':
      return <BarChart data={data} />;
    case 'pie':
      return <PieChart data={data} />;
    case 'polarArea':
      return <PolarAreaChart data={data} />;
    default:
      return <Result status="404" title="404" subTitle="Sorry, please select a chart type." />;
  }
};

export const defaultConfigFiller: {
  showTitle: boolean;
  simpleOrPivot: 'simple' | 'pivot';
  dataMode: TDataMode;
  entityType: string;
  axisProperty: string;
  valueProperty: string;
  aggregationMethod: TAggregationMethod;
} = {
  showTitle: true, 
  simpleOrPivot: 'simple',
  dataMode: 'entityType',
  entityType: 'Shesha.Domain.FormConfiguration',
  axisProperty: 'versionStatus',
  valueProperty: 'id',
  aggregationMethod: 'count',
};

/**
 * Function to stringify values in an array of objects
 * @param data array of objects to stringify values
 * @returns array of objects with stringified values
 */
export const stringifyValues = (data: object[]) => {
  return data?.map(item => {
    const processValue = (value: any): any => {
      if (value === null || value === undefined) {
        return 'undefined';
      }
      if (typeof value === 'object' && !(value instanceof Date)) {
        // Don't stringify objects, keep them as is for nested property access
        return value;
      }
      if (typeof value !== 'string') {
        return `${value}`;
      }
      return value;
    };

    const newItem: any = {};
    for (const key in item) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        newItem[key] = processValue(item[key]);
      }
    }
    return newItem;
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

  return array?.filter(path => path && path?.trim() !== '')?.map(path => {
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
 * @param groupingProperty legend property to use for the chart
 * @param axisProperty axis property to use for the chart
 * @returns getChartData mutate path and queryParams
 */
export const getChartDataRefetchParams = (entityType: string, dataProperty: string, filters: string, groupingProperty?: string, axisProperty?: string,  orderBy?: string, orderDirection?: TOrderDirection, skipCount?: number, maxResultCount?: number) => {
  return {
    path: `/api/services/app/Entities/GetAll`,
    queryParams: {
      entityType: entityType,
      properties: removePropertyDuplicates((convertNestedPropertiesToObjectFormat([dataProperty, groupingProperty, axisProperty])).replace(/\s/g, '')),
      filter: filters,
      sorting: orderBy ? `${orderBy} ${orderDirection ?? 'asc'}` : '',
      skipCount: skipCount ?? 0,
      maxResultCount: maxResultCount ?? 100,
      orderBy: orderBy ? `${orderBy} ${orderDirection ?? 'asc'}` : '',
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

/**
 * Helper function to create font configuration for Chart.js
 * @param fontConfig - The font configuration object
 * @param defaultSize - Default font size if not specified
 * @param defaultWeight - Default font weight if not specified
 * @returns Chart.js font configuration object
 */
export function createFontConfig(
  fontConfig?: { family?: string; size?: number; weight?: string; color?: string },
  defaultSize: number = 12,
  defaultWeight: string = '400'
) {
  return {
    family: fontConfig?.family || 'Segoe UI',
    size: fontConfig?.size || defaultSize,
    weight: fontConfig?.weight || defaultWeight
  };
}
