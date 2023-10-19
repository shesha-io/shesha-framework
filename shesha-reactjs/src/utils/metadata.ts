import { IconType } from "../components/shaIcon";
import { DataTypes } from "../interfaces/dataTypes";
import { IPropertyMetadata, isEntityReferencePropertyMetadata } from "../interfaces/metadata";
import { camelcaseDotNotation } from "../utils/string";
import ShaIcon from '../components/shaIcon';
import GenericOutlined from "../icons/genericOutlined";
import { JsonOutlined } from "../icons/jsonOutlined";
import { toCamelCase } from './string';

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
  if (isEntityReferencePropertyMetadata(metadata) && !metadata.entityType)
    return GenericOutlined(null);

  if (metadata.dataType === DataTypes.objectReference) return JsonOutlined(null);

  var iconType = getIconByDataType(metadata.dataType);
  if (iconType) return ShaIcon({iconName:iconType});
  return null;
};

export const getFullPath = (property: IPropertyMetadata) => {
  const name = camelcaseDotNotation(property.path);
  const prefix = property.prefix ? camelcaseDotNotation(property.prefix) : null;

  return (prefix ?? '') === ''
    ? camelcaseDotNotation(name)
    : `${prefix}.${name}`;
};

export const getDataFormat = (properties: IPropertyMetadata[], name: string) =>
  properties.find(({ path }) => toCamelCase(path) === name)?.dataFormat;