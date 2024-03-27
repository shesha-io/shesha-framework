import { IPropertyMetadata, SourceFile, TypeDefinition, isPropertiesArray } from "@/interfaces/metadata";
import { DataTypes } from "@/interfaces";
import { MetadataBuilder } from "@/utils/metadata/metadataBuilder";
import { SettingConfigurationDto } from "./models";
import { SettingsManager } from "./manager";
import { HttpClientApi } from "../http/api";
import { StringBruilder } from "@/utils/metadata/stringBruilder";

type SettingItemType = 'module' | 'category' | 'setting';

export interface ISettingPropertyMetadata extends IPropertyMetadata {
    settingItemType: SettingItemType;
}

/**
 * Convert the given settings configuration to an array of property metadata.
 *
 * @param {SettingConfigurationDto[]} settings - the settings configuration to be converted
 * @return {IPropertyMetadata[]} the array of property metadata
 */
const settingsConfigurationToProperties = (settings: SettingConfigurationDto[]): ISettingPropertyMetadata[] => {
    const result: ISettingPropertyMetadata[] = [];
    settings.forEach(setting => {
        let moduleProp = result.find(m => m.path === setting.module.accessor);
        if (!moduleProp) {
            moduleProp = {
                path: setting.module.accessor,
                label: setting.module.name,
                dataType: DataTypes.object,
                properties: [],
                settingItemType: 'module',
            };
            result.push(moduleProp);
        }
        if (!isPropertiesArray(moduleProp.properties))
            throw new Error("Something went wrong. Expected array of properties");

        let categoryProp = moduleProp.properties.find(p => p.path === setting.category.accessor) as ISettingPropertyMetadata;
        if (!categoryProp) {
            categoryProp = {
                path: setting.category.accessor,
                label: setting.category.name,
                dataType: DataTypes.object,
                properties: [],
                settingItemType: 'category',
            };
            moduleProp.properties.push(categoryProp);
        }

        const settingMetadata: ISettingPropertyMetadata = {
            path: setting.accessor,
            label: setting.name,
            description: setting.description,
            dataType: setting.dataType?.dataType,
            dataFormat: setting.dataType?.dataFormat,
            settingItemType: 'setting',
        };
        if (!isPropertiesArray(categoryProp.properties))
            throw new Error("Something went wrong. Expected array of properties");

        categoryProp.properties.push(settingMetadata);
    });

    return result;
};

/**
 * Fetches settings API as metadata properties.
 *
 * @param {AxiosRequestConfig} fetcherConfig - configuration for the fetcher
 * @return {Promise<IPropertyMetadata[]>} a promise of an array of property metadata
 */
export const fetchSettingsApiAsMetadataProperties = (httpClient: HttpClientApi): Promise<IPropertyMetadata[]> => {
    return SettingsManager.fetchConfigurationsAsync(httpClient).then(res => settingsConfigurationToProperties(res));
};

/**
 * Generate a TypeDefinition based on the given settings configuration.
 *
 * @param {SettingConfigurationDto[]} settings - the settings configuration to convert
 * @return {TypeDefinition} the generated TypeDefinition
 */
const settingsConfigurationToTypeDefinition = (settings: SettingConfigurationDto[]): TypeDefinition => {
    const apiFile: SourceFile = {
        fileName: "/apis/applicationSettingsApi.d.ts",
        content: ""
    };
    const result: TypeDefinition = {
        typeName: "ApplicationSettingsApi",
        files: [apiFile],
    };
    const content = [
        "/**",
        " * Setting Accessor",
        " */",
        "interface ApplicationSettingAccessor<TValue = any> {",
        "   getValueAsync(): Promise<TValue>;",
        "   setValueAsync(value: TValue): Promise<void>;",
        "}",
        "",
        "/**",
        " * Application Settings API",
        " */",
        `interface ${result.typeName} {`,
    ];

    const wroteObject = (sb: StringBruilder, property: ISettingPropertyMetadata) => {
        if (property.description)
            sb.append(`/** ${property.description} */`);

        sb.append(`${property.path}: {`);

        if (!isPropertiesArray(property.properties))
            throw new Error("Something went wrong. Settings should be an array of properties");

        sb.incIndent();
        property.properties.forEach(prop => {
            if ((prop as ISettingPropertyMetadata).settingItemType === 'setting') {
                if (prop.description)
                    sb.append(`/** ${prop.description} */`);
                sb.append(`${prop.path}: ApplicationSettingAccessor<${prop.dataType}>;`);
            } else
                if (prop.dataType === DataTypes.object) {
                    wroteObject(sb, prop as ISettingPropertyMetadata);
                }
        });
        sb.decIndent();
        sb.append("}");
    };

    const sb = new StringBruilder();
    sb.appendLines(content);

    const properties = settingsConfigurationToProperties(settings);

    sb.incIndent();
    properties.forEach(property => {
        wroteObject(sb, property);
    });
    sb.decIndent();


    sb.append("}");

    apiFile.content = sb.build();

    return result;
};

/**
 * Fetches the type definition from the settings API using the provided Axios request configuration.
 *
 * @param {AxiosRequestConfig} fetcherConfig - The configuration for the Axios request.
 * @return {Promise<TypeDefinition>} A promise that resolves to the type definition fetched from the API.
 */
const fetchSettingsApiTypeDefinition = (httpClient: HttpClientApi): Promise<TypeDefinition> => {
    return SettingsManager.fetchConfigurationsAsync(httpClient).then(res => settingsConfigurationToTypeDefinition(res));
};

/**
 * Returns a MetadataBuilder with properties loader and type definition set based on the provided axios configuration.
 *
 * @param {MetadataBuilder} builder - the MetadataBuilder instance
 * @param {AxiosRequestConfig} axiosConfig - the configuration for Axios HTTP client
 * @return {MetadataBuilder} the updated MetadataBuilder instance
 */
export const getSettingsApiProperties = (builder: MetadataBuilder, httpClient: HttpClientApi): MetadataBuilder => builder
    .setPropertiesLoader(() => fetchSettingsApiAsMetadataProperties(httpClient))
    .setTypeDefinition(() => fetchSettingsApiTypeDefinition(httpClient));