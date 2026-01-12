import { nanoid } from '@/utils/uuid';
import { IConfigurableColumnsProps, IDataColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { IExpressionExecuterArguments, executeScriptSync } from '@/providers/form/utils';
import { IConfigurableFormComponent, IStyleType } from "@/index";
import { IModelMetadata, IPropertyMetadata, isPropertiesArray, isPropertiesLoader } from '@/interfaces/metadata';
import { toCamelCase, humanizeString } from '@/utils/string';

const NEW_KEY = ['{{NEW_KEY}}', '{{GEN_KEY}}'];
const MAX_NUMBER_OF_DEFAULT_COLS = 20;

export const generateNewKey = (json: IConfigurableFormComponent[]): IConfigurableFormComponent[] => {
  try {
    let stringify = JSON.stringify(json);

    NEW_KEY.forEach((key) => {
      stringify = stringify.replaceAll(key, nanoid());
    });

    return JSON.parse(stringify);
  } catch {
    return json;
  }
};

export const filterVisibility =
  (context: IExpressionExecuterArguments) =>
    ({ customVisibility }: IConfigurableColumnsProps): boolean => {
      if (customVisibility) {
        return executeScriptSync(customVisibility, context);
      }

      return true;
    };

export const defaultStyles = (): IStyleType => {
  return {
    background: { type: 'color', color: '#fff' },
    font: { weight: '400', size: 14, color: '#000', type: 'Segoe UI', align: 'left' },
    border: {
      border: {
        all: { width: '1px', style: 'solid', color: '#d9d9d9' },
        top: { width: '1px', style: 'solid', color: '#d9d9d9' },
        bottom: { width: '1px', style: 'solid', color: '#d9d9d9' },
        left: { width: '1px', style: 'solid', color: '#d9d9d9' },
        right: { width: '1px', style: 'solid', color: '#d9d9d9' },
      },
      radius: { all: 6, topLeft: 6, topRight: 6, bottomLeft: 6, bottomRight: 6 },
      borderType: 'all',
      radiusType: 'all',
    },
    dimensions: { width: '100%', height: 'auto', minHeight: 'auto', maxHeight: 'auto', minWidth: '0px', maxWidth: 'none' },
    shadow: {
      offsetX: 0,
      offsetY: 2,
      blurRadius: 8,
      spreadRadius: 0,
      color: 'rgba(0, 0, 0, 0.1)',
    },
  };
};

export const getTableDefaults = (): {
  rowHeight: string;
  rowPadding: string;
  rowBorder: string;
  headerFontSize: string;
  headerFontWeight: string;
  rowAlternateBackgroundColor: string;
} => {
  return {
    // Row styling defaults
    rowHeight: '40px',
    rowPadding: '8px 12px',
    rowBorder: 'none',

    // Header styling defaults
    headerFontSize: '14px',
    headerFontWeight: '500',

    // Row color defaults
    rowAlternateBackgroundColor: '#f5f5f5',
  };
};

export const getTableSettingsDefaults = (): {
  tableSettings: {
    rowHeight: string;
    rowPadding: string;
    rowBorder: string;
    headerFontSize: string;
    headerFontWeight: string;
    rowAlternateBackgroundColor: string;
  };
} => {
  const flatDefaults = getTableDefaults();
  return {
    tableSettings: flatDefaults,
  };
};

// Auditing columns to exclude from default column generation
export const AUDITING_COLUMNS = Object.freeze([
  'id',
  // 'isDeleted',
  // 'deleterUserId',
  // 'deletionTime',
  // 'lastModificationTime',
  // 'lastModifierUserId',
  // 'creationTime',
  // 'creatorUserId',
  'markup',
]);

// Supported data types for table columns
export const SUPPORTED_COLUMN_DATA_TYPES = [
  'string',
  'number',
  'boolean',
  'date',
  'date-time',
];

/**
 * Filters metadata properties to exclude auditing and framework-related properties
 * @param properties - Array of property metadata
 * @returns Filtered array of properties suitable for table columns
 */
export const filterPropertiesForTable = (properties: IPropertyMetadata[]): IPropertyMetadata[] => {
  return properties.filter((prop: IPropertyMetadata) => {
    const columnName = prop.path || prop.columnName || '';
    const isAuditing = AUDITING_COLUMNS.includes(columnName.toLowerCase());
    const isFramework = prop.isFrameworkRelated === true;
    const isId = columnName.toLowerCase() === 'id';
    return !isAuditing && !isFramework && !isId;
  });
};

/**
 * Filters properties by supported data types for table columns
 * @param properties - Array of property metadata
 * @returns Properties with supported data types for table display
 */
export const filterPropertiesBySupportedTypes = (properties: IPropertyMetadata[]): IPropertyMetadata[] => {
  return properties.filter((property: IPropertyMetadata) => {
    return property.dataType && SUPPORTED_COLUMN_DATA_TYPES.includes(property.dataType);
  });
};

/**
 * Converts property metadata to DataTable column configuration
 * @param property - Property metadata
 * @param index - Column index for sorting
 * @returns DataTable column configuration
 */
export const propertyToDataColumn = (property: IPropertyMetadata, index: number): IDataColumnsProps => {
  // Guard against undefined or empty property.path
  const rawPath = property.path ?? '';
  const fallbackId = `col_${index}`;

  return {
    id: rawPath || fallbackId,
    caption: property.label ?? (rawPath ? humanizeString(rawPath) : `Column ${index + 1}`),
    description: property.description,
    columnType: 'data' as const,
    sortOrder: index,
    itemType: 'item' as const,
    isVisible: property.isVisible !== false, // Default to visible unless explicitly false
    propertyName: rawPath !== '' ? toCamelCase(rawPath) : fallbackId,
    allowSorting: true,
    accessor: rawPath !== '' ? toCamelCase(rawPath) : fallbackId,
  };
};

/**
 * Calculates default columns for a DataTable
 *
 * Processing order:
 * 1. Filter out 'id' and framework-related properties (auditing columns like isDeleted, creationTime, etc. are included)
 * 2. Filter by supported data types (string, number, boolean, date, date-time)
 * 3. Apply maxNumber limit (20) to the resulting valid columns
 *
 * @param metadata - Model metadata containing properties
 * @returns Promise resolving to array of DataTable column configurations (max 20 valid columns)
 */
export const calculateDefaultColumns = async (metadata: IModelMetadata): Promise<IDataColumnsProps[]> => {
  if (!metadata || !metadata.properties) {
    console.warn('❌ No metadata available for column registration');
    return [];
  }

  let properties: IPropertyMetadata[] = [];

  if (isPropertiesArray(metadata.properties)) {
    properties = metadata.properties;
  } else if (isPropertiesLoader(metadata.properties)) {
    try {
      properties = await metadata.properties();
      if (!properties) {
        console.warn('⚠️ PropertiesLoader returned null/undefined, using empty array');
        properties = [];
      }
    } catch (error) {
      console.warn('❌ Failed to load properties from PropertiesLoader:', error);
      return [];
    }
  } else {
    // metadata.properties is null or undefined
    return [];
  }

  // Filter out framework-related properties (include auditing columns)
  const filteredProperties = filterPropertiesForTable(properties);

  // Get properties suitable for table columns (filter by supported types)
  const supportedProperties = filterPropertiesBySupportedTypes(filteredProperties);

  // Apply maxNumber limit to the list of supported properties
  const tableColumns = MAX_NUMBER_OF_DEFAULT_COLS > 0 && supportedProperties.length > MAX_NUMBER_OF_DEFAULT_COLS
    ? supportedProperties.slice(0, MAX_NUMBER_OF_DEFAULT_COLS)
    : supportedProperties;

  const columnItems: IDataColumnsProps[] = tableColumns.map(propertyToDataColumn);

  return columnItems;
};

const addPxUnit = (value?: string | number): string => {
  if (!value && value !== 0) return '0px';
  const strValue = String(value);
  if (/^-?\d+\.?\d*$/.test(strValue)) {
    return `${strValue}px`;
  }
  return strValue;
};

export const convertRowDimensionsToHeight = (rowDimensions?: {
  height?: string;
  minHeight?: string;
  maxHeight?: string;
}): string | undefined => {
  if (!rowDimensions?.height) return undefined;
  return addPxUnit(rowDimensions.height);
};

export type RowStylingBoxType = {
  padding?: {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
  };
  paddingTop?: string | number;
  paddingRight?: string | number;
  paddingBottom?: string | number;
  paddingLeft?: string | number;
};

export const convertRowStylingBoxToPadding = (rowStylingBox?: string | RowStylingBoxType): string | undefined => {
  if (!rowStylingBox) return undefined;

  let stylingBox: RowStylingBoxType;
  if (typeof rowStylingBox === 'string') {
    try {
      stylingBox = JSON.parse(rowStylingBox);
    } catch (e) {
      console.warn('Failed to parse rowStylingBox JSON:', e);
      return undefined;
    }
  } else {
    stylingBox = rowStylingBox;
  }

  let top: string | number | undefined;
  let right: string | number | undefined;
  let bottom: string | number | undefined;
  let left: string | number | undefined;

  if (stylingBox?.padding) {
    top = stylingBox.padding.top;
    right = stylingBox.padding.right;
    bottom = stylingBox.padding.bottom;
    left = stylingBox.padding.left;
  } else if (stylingBox?.paddingTop || stylingBox?.paddingRight ||
    stylingBox?.paddingBottom || stylingBox?.paddingLeft) {
    top = stylingBox.paddingTop;
    right = stylingBox.paddingRight;
    bottom = stylingBox.paddingBottom;
    left = stylingBox.paddingLeft;
  } else {
    return undefined;
  }

  const topPx = addPxUnit(top);
  const rightPx = addPxUnit(right);
  const bottomPx = addPxUnit(bottom);
  const leftPx = addPxUnit(left);

  if (topPx === rightPx && rightPx === bottomPx && bottomPx === leftPx) {
    return topPx;
  }

  if (topPx === bottomPx && leftPx === rightPx) {
    return `${topPx} ${leftPx}`;
  }

  return `${topPx} ${rightPx} ${bottomPx} ${leftPx}`;
};

export const convertRowBorderStyleToBorder = (rowBorderStyle?: {
  borderType?: string;
  border?: {
    all?: { width?: string | number; style?: string; color?: string };
    top?: { width?: string | number; style?: string; color?: string };
    right?: { width?: string | number; style?: string; color?: string };
    bottom?: { width?: string | number; style?: string; color?: string };
    left?: { width?: string | number; style?: string; color?: string };
  };
}): string | undefined => {
  if (!rowBorderStyle?.border) return undefined;

  const { borderType, border } = rowBorderStyle;

  if (borderType === 'all' && border.all) {
    const { width, style, color } = border.all;
    if (!width || !style || !color) return undefined;
    return `${addPxUnit(width)} ${style} ${color}`;
  }

  const firstBorder = border.top || border.right || border.bottom || border.left;
  if (firstBorder) {
    const { width, style, color } = firstBorder;
    if (!width || !style || !color) return undefined;
    return `${addPxUnit(width)} ${style} ${color}`;
  }

  return undefined;
};
