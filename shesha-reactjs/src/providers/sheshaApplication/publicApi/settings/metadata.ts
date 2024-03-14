import { IPropertyMetadata, SourceFile, TypeDefinition, isPropertiesArray } from "@/interfaces/metadata";
import { DataTypes } from "@/interfaces";
import { verifiedCamelCase } from "@/utils/string";
import { MetadataBuilder } from "@/utils/metadata/metadataBuilder";
import { SettingConfigurationDto } from "./models";
import { SettingsManager } from "./manager";
import { HttpClientApi } from "../http/api";

/**
 * Convert the given settings configuration to an array of property metadata.
 *
 * @param {SettingConfigurationDto[]} settings - the settings configuration to be converted
 * @return {IPropertyMetadata[]} the array of property metadata
 */
const settingsConfigurationToProperties = (settings: SettingConfigurationDto[]): IPropertyMetadata[] => {
    const result: IPropertyMetadata[] = [];
    const modules = new Map<string, IPropertyMetadata>();
    settings.forEach(setting => {
        let appModule = modules.get(setting.module.name);
        if (!appModule) {
            appModule = {
                path: setting.module.name,
                dataType: DataTypes.object,
                properties: [],
            };
            modules.set(setting.module.name, appModule);

            result.push(appModule);
        }
        if (!isPropertiesArray(appModule.properties))
            throw new Error("Something went wrong. Settings should be an array of properties");

        appModule.properties.push({
            path: verifiedCamelCase(setting.name),
            description: setting.description,
            dataType: setting.dataType,
        });
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
    const modules = new Map<string, IPropertyMetadata>();
    settings.forEach(setting => {
        const moduleName = verifiedCamelCase(setting.module.name);
        let appModule = modules.get(moduleName);
        if (!appModule) {
            appModule = {
                path: moduleName,
                dataType: DataTypes.object,
                properties: [],
            };
            modules.set(moduleName, appModule);
        }
        if (!isPropertiesArray(appModule.properties))
            throw new Error("Something went wrong. Settings should be an array of properties");

        appModule.properties.push({
            path: verifiedCamelCase(setting.name),
            description: setting.description,
            dataType: setting.dataType,
        });
    });
    const content = [
        "/**",
        " * Setting Accessor",
        " */",
        "interface ApplicationSettingAccessor<TValue = any> {",
        "   getValueAsync(): Promise<TValue>;",
        "   setValue(value: TValue): Promise<void>;",
        "}",
        "",
        "/**",
        " * Application Settings API",
        " */",
        `interface ${result.typeName} {`,
    ];
    modules.forEach(appModule => {
        if (appModule.description)
            content.push(`    /** ${appModule.description} */`);
        content.push(`    ${appModule.path}: {`);

        if (!isPropertiesArray(appModule.properties))
            throw new Error("Something went wrong. Settings should be an array of properties");

        appModule.properties.forEach(prop => {
            if (prop.description)
                content.push(`        /** ${prop.description} */`);
            content.push(`        ${prop.path}: ApplicationSettingAccessor<${prop.dataType}>;`);
        });
        content.push(`    }`);
    });
    content.push("}");
    apiFile.content = content.join("\r\n");

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