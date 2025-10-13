import { FieldOrGroup, FieldSettings } from '@react-awesome-query-builder/antd';
import { IPropertyMetadata } from '@/interfaces/metadata';

// Fields

export interface CustomFieldSettings {
  typeShortAlias?: string;
  referenceListName?: string;
  referenceListModule?: string;
  allowInherited?: boolean;
  propertyMetadata: IPropertyMetadata;
}

export interface IProperty {
  label: string;
  propertyName: string;
  dataType: string;
  visible: boolean;
  fieldSettings?: FieldSettings | CustomFieldSettings;
  childProperties?: IProperty[];
  [key: string]: any;
}

export interface IHasQueryBuilderConfig extends IProperty {
  convert: (property: IProperty) => FieldOrGroup;
}

export const propertyHasQBConfig = (property: IProperty): property is IHasQueryBuilderConfig => {
  return property && typeof ((property as IHasQueryBuilderConfig).convert) === 'function';
};

export interface IHasCustomQBSettings {
  toQueryBuilderField: (defaultConverter: () => FieldOrGroup) => FieldOrGroup;
}

export interface IPropertyMetadataWithQBSettings extends IPropertyMetadata, IHasCustomQBSettings {

}
export interface IPropertyWithCustomQBSettings extends IProperty, IHasCustomQBSettings {

}

export const hasCustomQBSettings = (property: unknown): property is IHasCustomQBSettings => {
  return property && typeof ((property as IPropertyMetadataWithQBSettings).toQueryBuilderField) === 'function';
};
