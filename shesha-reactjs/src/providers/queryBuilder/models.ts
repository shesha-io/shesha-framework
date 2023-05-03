import { FieldSettings } from '@react-awesome-query-builder/antd';

//Fields

export interface CustomFieldSettings {
  typeShortAlias?: string;
  referenceListName?: string;
  referenceListModule?: string;
  allowInherited?: boolean;
}

export interface IProperty {
  label: string;
  propertyName: string;
  dataType: string;
  visible: boolean;
  fieldSettings?: FieldSettings | CustomFieldSettings;
  preferWidgets?: string[];
  childProperties?: IProperty[];
}
