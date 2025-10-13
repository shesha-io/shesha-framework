import { IContent, formatDateStringAndPrefix } from '@/designer-components/text/utils';
import ShaIcon, { IconType } from '@/components/shaIcon';
import GenericOutlined from '@/icons/genericOutlined';
import { JsonOutlined } from '@/icons/jsonOutlined';
import { DataTypes, ObjectFormats } from '@/interfaces/dataTypes';
import { IModelMetadata, IPropertyMetadata, isEntityMetadata, isEntityReferencePropertyMetadata, isPropertiesArray } from '@/interfaces/metadata';
import { camelcaseDotNotation, getNumberFormat, toCamelCase } from '@/utils/string';

import React, { ReactNode } from 'react';
import { ProductOutlined } from '@ant-design/icons';

export const getIconTypeByDataType = (dataType: string): IconType => {
  switch (dataType) {
    case DataTypes.array:
      return 'DatabaseOutlined';
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
      return 'OrderedListOutlined';
    case DataTypes.specification:
      return 'BulbOutlined';
    case DataTypes.file:
      return 'FileOutlined';
    default:
      return null;
  }
};

export const getIconByDataType = (dataType: string, dataFormat: string): React.ReactNode => {
  if (dataType === DataTypes.advanced) return <ProductOutlined />;
  if (dataType === DataTypes.object) return <JsonOutlined />;
  if (dataType === DataTypes.entityReference && !dataFormat) return <GenericOutlined />;
  var iconType = getIconTypeByDataType(dataType);
  if (iconType) return <ShaIcon iconName={iconType} />;
  return null;
};

export const getIconByPropertyMetadata = (metadata: IPropertyMetadata): ReactNode => {
  if (isEntityReferencePropertyMetadata(metadata) && !metadata.entityType) return GenericOutlined(null);

  if (metadata.dataType === DataTypes.object && metadata.dataFormat === ObjectFormats.interface) return JsonOutlined(null);

  var iconType = getIconTypeByDataType(metadata.dataType);
  if (iconType) return <ShaIcon iconName={iconType} />;
  return null;
};

export const getFullPath = (property: IPropertyMetadata): string => {
  const name = camelcaseDotNotation(property.path);
  const prefix = property.prefix ? camelcaseDotNotation(property.prefix) : null;

  return (prefix ?? '') === '' ? camelcaseDotNotation(name) : `${prefix}.${name}`;
};

export const getDataProperty = <TProp extends keyof IPropertyMetadata = keyof IPropertyMetadata, TValue = IPropertyMetadata[TProp]>(properties: IPropertyMetadata[], name: string, propertyName: TProp): TValue | undefined =>
  properties.find(({ path }) => toCamelCase(path) === name)?.[propertyName];

export const getFormatContent = (content: string, metadata: Pick<IContent, 'dataFormat' | 'dataType'>): string => {
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
    ? metadata.properties.find((p) => p.path?.toLowerCase() === "id")?.dataType
    : undefined;
};

export const getEntityIdJsType = (metadata: IModelMetadata): string => {
  const idType = getEntityIdType(metadata);
  return idType === DataTypes.guid ? "string" : idType;
};
