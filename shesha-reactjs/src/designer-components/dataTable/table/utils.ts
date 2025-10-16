import { nanoid } from '@/utils/uuid';
import { IConfigurableColumnsProps, IDataColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { IExpressionExecuterArguments, executeScriptSync } from '@/providers/form/utils';
import { IConfigurableFormComponent, IStyleType } from "@/index";
import { IModelMetadata, IPropertyMetadata, isPropertiesArray } from '@/interfaces/metadata';
import { toCamelCase } from '@/utils/string';

const NEW_KEY = ['{{NEW_KEY}}', '{{GEN_KEY}}'];

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
    dimensions: { width: '100%', height: 'auto', minHeight: '200px', maxHeight: 'none', minWidth: '0px', maxWidth: 'none' },
    shadow: {
      offsetX: 0,
      offsetY: 2,
      blurRadius: 8,
      spreadRadius: 0,
      color: 'rgba(0, 0, 0, 0.1)',
    },
  };
};

// Auditing columns to exclude from default column generation
export const AUDITING_COLUMNS = [
  'id',
  'isDeleted',
  'deleterUserId',
  'deletionTime',
  'lastModificationTime',
  'lastModifierUserId',
  'creationTime',
  'creatorUserId',
  'markup',
];

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
    const isFramework = prop.isFrameworkRelated;
    return !isAuditing && !isFramework;
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
  return {
    id: property.path || `col_${index}`,
    caption: property.path,
    description: property.description,
    columnType: 'data' as const,
    sortOrder: index,
    itemType: 'item' as const,
    isVisible: property.isVisible !== false, // Default to visible unless explicitly false
    propertyName: toCamelCase(property.path),
    allowSorting: true,
    accessor: toCamelCase(property.path),
  };
};

/**
 * Calculates default columns for a DataTable
 * @param metadata - Model metadata containing properties
 * @returns Array of DataTable column configurations
 */
export const calculateDefaultColumns = (metadata: IModelMetadata): IDataColumnsProps[] => {
  if (!metadata || !metadata.properties) {
    console.warn('❌ No metadata available for column registration');
    return [];
  }

  const properties = isPropertiesArray(metadata.properties)
    ? metadata.properties
    : [];

  // Filter out auditing columns and framework-related properties
  const filteredProperties = filterPropertiesForTable(properties);

  // Get properties suitable for table columns
  const tableColumns = filterPropertiesBySupportedTypes(filteredProperties);

  // Create IDataColumnsProps from filtered properties
  const columnItems: IDataColumnsProps[] = tableColumns.map(propertyToDataColumn);

  return columnItems;
};
