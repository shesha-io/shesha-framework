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