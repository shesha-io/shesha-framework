import { DataTypes } from '@/interfaces/dataTypes';
import { CustomFieldSettings, IProperty } from '@/providers/queryBuilder/models';
import { isDefined } from '@/utils/nullables';

export type FieldKind =
  'text' |
  'number' |
  'date' |
  'datetime' |
  'time' |
  'boolean' |
  'refList' |
  'entityReference' |
  'guid' |
  'specification' |
  'container' |
  'unknown';

export interface QueryField {
  path: string;
  label: string;
  kind: FieldKind;
  property: IProperty;
  settings: Partial<CustomFieldSettings>;
}

export const getFieldKind = (dataType: string | undefined): FieldKind => {
  switch (dataType) {
    case DataTypes.string:
      return 'text';
    case DataTypes.number:
      return 'number';
    case DataTypes.date:
      return 'date';
    case DataTypes.dateTime:
      return 'datetime';
    case DataTypes.time:
      return 'time';
    case DataTypes.boolean:
      return 'boolean';
    case DataTypes.referenceListItem:
    case 'refList':
      return 'refList';
    case DataTypes.entityReference:
    case 'entityReference':
      return 'entityReference';
    case DataTypes.guid:
      return 'guid';
    case DataTypes.specification:
      return 'specification';
    case '!struct':
    case DataTypes.object:
      return 'container';
    default:
      return 'unknown';
  }
};

const isCustomSettings = (value: unknown): value is Partial<CustomFieldSettings> => isDefined(value) && typeof value === 'object';

export const toQueryField = (property: IProperty): QueryField => ({
  path: property.propertyName,
  label: property.label,
  kind: getFieldKind(property.dataType),
  property,
  settings: isCustomSettings(property.fieldSettings) ? property.fieldSettings : {},
});

/** Finds a property by its full dotted path; nested properties carry their full path in `propertyName`. */
export const findProperty = (fields: IProperty[], path: string | undefined): IProperty | undefined => {
  if (!isDefined(path) || path === '') return undefined;
  for (const field of fields) {
    if (field.propertyName === path) return field;
    if (field.childProperties.length > 0) {
      const nested = findProperty(field.childProperties, path);
      if (nested) return nested;
    }
  }
  return undefined;
};

export const findField = (fields: IProperty[], path: string | undefined): QueryField | undefined => {
  const property = findProperty(fields, path);
  return property ? toQueryField(property) : undefined;
};

export const isDateLikeKind = (kind: FieldKind | undefined): boolean => kind === 'date' || kind === 'datetime' || kind === 'time';
