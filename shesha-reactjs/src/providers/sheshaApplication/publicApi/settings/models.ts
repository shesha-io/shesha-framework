/*
export interface SettingConfigurationDto {
    name: string;
    label: string;
    description: string;
    dataType: string;
    module: {
        name: string;
        description?: string;
    };
}
*/
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