import { IHasEntityType, IPropertyMetadata, ITypeDefinitionLoadingContext, SourceFile, TypeDefinition, isEntityReferencePropertyMetadata, isPropertiesArray } from "@/interfaces/metadata";
import { MetadataBuilder } from "@/utils/metadata/metadataBuilder";
import { EntitiesManager } from "./manager";
import { HttpClientApi } from "../http/api";
import { EntityConfigurationDto } from "./models";
import { DataTypes } from "@/interfaces";
import { StringBruilder } from "@/utils/metadata/stringBruilder";
import { TypesImporter } from "@/utils/metadata/typesImporter";

type EntityItemType = 'module' | 'entityType';

export interface IEntityPropertyMetadata extends IPropertyMetadata {
    entityItemType: EntityItemType;
}

/**
 * Convert the given entity configurations to an array of property metadata.
 *
 * @param {EntityConfigurationDto[]} entityConfigs - The array of entity configurations.
 * @return {IEntityPropertyMetadata[]} The array of property metadata objects.
 */
const entitiesConfigurationToProperties = (entityConfigs: EntityConfigurationDto[]): IEntityPropertyMetadata[] => {
    const result: IEntityPropertyMetadata[] = [];
    entityConfigs.forEach(entityConfig => {
        let moduleProp = result.find(m => m.path === entityConfig.module.accessor);
        if (!moduleProp) {
            moduleProp = {
                path: entityConfig.module.accessor,
                label: entityConfig.module.name,
                dataType: DataTypes.object,
                properties: [],
                entityItemType: 'module',
            };
            result.push(moduleProp);
        }
        if (!isPropertiesArray(moduleProp.properties))
            throw new Error("Something went wrong. Expected array of properties");

        const settingMetadata: IEntityPropertyMetadata & IHasEntityType = {
            path: entityConfig.accessor,
            label: entityConfig.name,
            description: entityConfig.description,
            dataType: DataTypes.entityReference,
            entityType: entityConfig.name,
            entityModule: entityConfig.module.name,
            properties: [],
            entityItemType: 'entityType',
        };
        if (!isPropertiesArray(moduleProp.properties))
            throw new Error("Something went wrong. Expected array of properties");

        moduleProp.properties.push(settingMetadata);
    });

    return result;
};

/**
 * Fetches the entities API as metadata properties using the provided HTTP client.
 *
 * @param {HttpClientApi} httpClient - The HTTP client to use for the API request.
 * @return {Promise<IPropertyMetadata[]>} A promise that resolves to an array of property metadata objects.
 */
export const fetchEntitiesApiAsMetadataProperties = (httpClient: HttpClientApi): Promise<IPropertyMetadata[]> => {
    return EntitiesManager.fetchConfigurationsAsync(httpClient).then(res => entitiesConfigurationToProperties(res));
};

const entitiesConfigurationToTypeDefinition = async (configurations: EntityConfigurationDto[], context: ITypeDefinitionLoadingContext): Promise<TypeDefinition> => {
    const apiFile: SourceFile = {
        fileName: "apis/entitiesApi.d.ts",
        content: ""
    };
    const result: TypeDefinition = {
        typeName: "EntitiesApi",
        files: [apiFile],
    };
    const content = [
        "/*",
        " * Entity with typed id",
        " */",
        "export interface IEntity<TId = string> {",
        "    id: TId;",
        "}",
        "",
        "export interface EntityAccessor<TId = string, TEntity extends IEntity<TId> = IEntity<TId>> {",
        "    createAsync: (value: TEntity) => Promise<TEntity>;",
        "    getAsync: (id: TId) => Promise<TEntity>;",
        "    updateAsync: (value: TEntity) => Promise<TEntity>;",
        "    deleteAsync: (id: TId) => Promise<TEntity>;",
        "}",
        "",
        `export interface ${result.typeName} {`,
    ];

    const typesBuilder = context.typeDefinitionBuilder;

    const writeObject = async (sb: StringBruilder, typesImporter: TypesImporter, property: IEntityPropertyMetadata): Promise<void> => {
        if (property.description)
            sb.append(`/** ${property.description} */`);

        sb.append(`${property.path}: {`);

        if (!isPropertiesArray(property.properties))
            throw new Error("Something went wrong. Entity properties should be an array of properties");

        sb.incIndent();

        for (const prop of property.properties) {
            if ((prop as IEntityPropertyMetadata).entityItemType === 'entityType' && isEntityReferencePropertyMetadata(prop)) {
                //console.log(`LOG: process entity '${prop.path}'`, prop);

                const typeDef = await typesBuilder.getEntityType({ name: prop.entityType, module: prop.entityModule });
                typesImporter.import(typeDef);

                if (prop.description)
                    sb.append(`/** ${prop.description} */`);
                sb.append(`${prop.path}: EntityAccessor<string, ${typeDef.typeName}>;`);
            } /*else
                if (prop.dataType === DataTypes.object) {
                    await writeObject(sb, typesImporter, prop as IEntityPropertyMetadata);
                }*/
        }
        sb.decIndent();
        sb.append("}");
    };

    const typesImporter = new TypesImporter();
    const sb = new StringBruilder();
    sb.appendLines(content);

    const properties = entitiesConfigurationToProperties(configurations);

    sb.incIndent();

    for (const property of properties) {
        //console.groupCollapsed(`LOG: process property '${property.path}'`);
        await writeObject(sb, typesImporter, property);

        //console.groupEnd();
    }
    sb.decIndent();

    sb.append("}");

    const exportSection = sb.build();
    const importSection = typesImporter.generateImports();

    apiFile.content = `${importSection}\n\n${exportSection}`;

    return result;
};

/**
 * Fetches the API type definition for entities using the provided HTTP client.
 *
 * @param {HttpClientApi} httpClient - The HTTP client used to make the API request.
 * @return {Promise<TypeDefinition>} A promise that resolves to the type definition of the entities API.
 */
const fetchEntitiesApiTypeDefinition = (context: ITypeDefinitionLoadingContext, httpClient: HttpClientApi): Promise<TypeDefinition> => {
    return EntitiesManager.fetchConfigurationsAsync(httpClient).then(res => entitiesConfigurationToTypeDefinition(res, context));
};

/**
 * Returns a MetadataBuilder with properties loader and type definition set based on the provided MetadataBuilder and HttpClientApi.
 *
 * @param {MetadataBuilder} builder - the MetadataBuilder instance
 * @param {HttpClientApi} httpClient - the HttpClientApi instance
 * @return {MetadataBuilder} the MetadataBuilder instance with properties loader and type definition set
 */
export const getEntitiesApiProperties = (builder: MetadataBuilder, httpClient: HttpClientApi): MetadataBuilder => builder
    .setPropertiesLoader(() => fetchEntitiesApiAsMetadataProperties(httpClient))
    .setTypeDefinition((ctx) => fetchEntitiesApiTypeDefinition(ctx, httpClient));