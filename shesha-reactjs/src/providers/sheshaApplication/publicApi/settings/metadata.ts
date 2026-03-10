import { IPropertyMetadata, SourceFile, TypeDefinition, isPropertiesArray } from "@/interfaces/metadata";
import { DataTypes } from "@/interfaces";
import { IObjectMetadataBuilder } from "@/utils/metadata/metadataBuilder";
import { SettingConfigurationDto } from "./models";
import { SettingsManager } from "./manager";
import { HttpClientApi } from "@/publicJsApis/httpClient";
import { StringBuilder } from "@/utils/metadata/stringBuilder";

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
  settings.forEach((setting) => {
    let moduleProp = result.find((m) => m.path === setting.module.accessor);
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

    let categoryProp = moduleProp.properties.find((p) => p.path === setting.category.accessor) as ISettingPropertyMetadata;
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
 * @param {HttpClientApi} httpClient - The HttpClientApi used to make the API request.
 * @return {Promise<IPropertyMetadata[]>} a promise of an array of property metadata
 */
export const fetchSettingsApiAsMetadataProperties = (httpClient: HttpClientApi): Promise<IPropertyMetadata[]> => {
  return SettingsManager.fetchConfigurationsAsync(httpClient).then((res) => settingsConfigurationToProperties(res));
};

/**
 * Generate a TypeDefinition based on the given settings configuration.
 *
 * @param {SettingConfigurationDto[]} settings - the settings configuration to convert
 * @return {TypeDefinition} the generated TypeDefinition
 */
const settingsConfigurationToTypeDefinition = (settings: SettingConfigurationDto[]): TypeDefinition => {
  const apiFile: SourceFile = {
    fileName: "apis/applicationSettingsApi.d.ts",
    content: "",
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
    `export interface ${result.typeName} {`,
  ];

  const writeObject = (sb: StringBuilder, property: ISettingPropertyMetadata): void => {
    if (property.description)
      sb.append(`/** ${property.description} */`);

    sb.append(`${property.path}: {`);

    if (!isPropertiesArray(property.properties))
      throw new Error("Something went wrong. Settings should be an array of properties");

    sb.incIndent();
    property.properties.forEach((prop) => {
      if ((prop as ISettingPropertyMetadata).settingItemType === 'setting') {
        if (prop.description)
          sb.append(`/** ${prop.description} */`);
        sb.append(`${prop.path}: ApplicationSettingAccessor<${prop.dataType}>;`);
      } else
        if (prop.dataType === DataTypes.object) {
          writeObject(sb, prop as ISettingPropertyMetadata);
        }
    });
    sb.decIndent();
    sb.append("}");
  };

  const sb = new StringBuilder();
  sb.appendLines(content);

  const properties = settingsConfigurationToProperties(settings);

  sb.incIndent();
  properties.forEach((property) => {
    writeObject(sb, property);
  });
  sb.decIndent();


  sb.append("}");

  apiFile.content = sb.build();

  return result;
};

/**
 * Fetches the type definition for the Settings API using the provided HttpClient.
 *
 * @param {HttpClientApi} httpClient - The HttpClient to use for fetching the configurations.
 * @return {Promise<TypeDefinition>} A Promise that resolves to the TypeDefinition for the Settings API.
 */
const fetchSettingsApiTypeDefinition = (httpClient: HttpClientApi): Promise<TypeDefinition> => {
  return SettingsManager.fetchConfigurationsAsync(httpClient).then((res) => settingsConfigurationToTypeDefinition(res));
};

/**
 * Returns a MetadataBuilder with properties loader and type definition set.
 *
 * @param {MetadataBuilder} builder - The MetadataBuilder used to build the settings API properties.
 * @param {HttpClientApi} httpClient - The HttpClientApi used to make the API request.
 * @return {MetadataBuilder} The MetadataBuilder with the settings API properties set.
 */
export const getSettingsApiProperties = (builder: IObjectMetadataBuilder, httpClient: HttpClientApi): IObjectMetadataBuilder => builder
  .setPropertiesLoader(() => fetchSettingsApiAsMetadataProperties(httpClient))
  .setTypeDefinition(() => fetchSettingsApiTypeDefinition(httpClient));
