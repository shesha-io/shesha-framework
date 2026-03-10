export interface SettingApiItem {
  name: string;
  description?: string;
  accessor: string;
}

export interface DataTypeInfo {
  dataType: string;
  dataFormat?: string;
  objectType?: string;
}

export interface SettingConfigurationDto extends SettingApiItem {
  dataType: DataTypeInfo;
  module: SettingApiItem;
  category: SettingApiItem;
}
