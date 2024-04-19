
import ShaIcon, { IconType } from '@/components/shaIcon';
import { IContent, formatDateStringAndPrefix } from '@/designer-components/text/utils';
import GenericOutlined from '@/icons/genericOutlined';
import { JsonOutlined } from '@/icons/jsonOutlined';
import { DataTypes } from '@/interfaces/dataTypes';
import { IModelMetadata, IPropertyMetadata, NestedProperties, isEntityMetadata, isEntityReferencePropertyMetadata, isPropertiesArray } from '@/interfaces/metadata';
import { camelcaseDotNotation, getNumberFormat } from '@/utils/string';
import { toCamelCase } from '../string';

export const getIconByDataType = (dataType: string): IconType => {
  switch (dataType) {
    case DataTypes.array:
      return 'OrderedListOutlined';
    case DataTypes.object:
      return 'PartitionOutlined';
    case DataTypes.string:
      return 'FieldStringOutlined';
    case DataTypes.number:
      return 'FieldNumberOutlined';
    case DataTypes.entityReference:
      return 'PartitionOutlined';
    case DataTypes.date:
      return 'CalendarOutlined';
    case DataTypes.dateTime:
      return 'FieldTimeOutlined';
    case DataTypes.time:
      return 'ClockCircleOutlined';
    case DataTypes.guid:
      return 'LinkOutlined';
    case DataTypes.boolean:
      return 'CheckSquareOutlined';
    case DataTypes.referenceListItem:
      return 'BookOutlined';
    case DataTypes.specification:
      return 'BulbOutlined';

    default:
      return null;
  }
};

export const getIconByPropertyMetadata = (metadata: IPropertyMetadata) => {
  if (isEntityReferencePropertyMetadata(metadata) && !metadata.entityType) return GenericOutlined(null);

  if (metadata.dataType === DataTypes.objectReference) return JsonOutlined(null);

  var iconType = getIconByDataType(metadata.dataType);
  if (iconType) return ShaIcon({ iconName: iconType });
  return null;
};

export const getFullPath = (property: IPropertyMetadata) => {
  const name = camelcaseDotNotation(property.path);
  const prefix = property.prefix ? camelcaseDotNotation(property.prefix) : null;

  return (prefix ?? '') === '' ? camelcaseDotNotation(name) : `${prefix}.${name}`;
};

export const getDataProperty = async (properties: IPropertyMetadata[], name: string, metaProperties: NestedProperties, propertyName: string = 'dataFormat') => {
const property = properties.find(({ path }) => toCamelCase(path) === name)?.[propertyName];

console.log(property, name, properties)
  if (property) {
    return property;
  }

  const entityIndex = properties.findIndex(p => p.dataType === 'entity');
  if (entityIndex !== -1 && name) {
    const entityProperties = await metaProperties[entityIndex]?.properties();
    if (entityProperties) {
      
      return entityProperties.find(({ path }) => toCamelCase(path) === name)?.[propertyName];
    }
  }

  return null;
};




export const getFormatContent = (content: string, metadata: Pick<IContent, 'dataFormat' | 'dataType'>) => {
  const { dataType, dataFormat } = metadata || {};

  switch (dataType) {
    case 'boolean':
      return !!content ? 'Yes' : 'No';

    case 'date-time':
      return formatDateStringAndPrefix(content, dataFormat);

    case 'number':
      return getNumberFormat(content, dataFormat || 'round');

    default:
      return content;
  }
};

export const getEntityIdType = (metadata: IModelMetadata): string => {
  if (!isEntityMetadata(metadata))
    return undefined;

  return isPropertiesArray(metadata.properties)
    ? metadata.properties.find(p => p.path?.toLowerCase() === "id")?.dataType
    : undefined;
};

export const getEntityIdJsType = (metadata: IModelMetadata): string => {
  const idType = getEntityIdType(metadata);
  return idType === DataTypes.guid ? "string" : idType;
};