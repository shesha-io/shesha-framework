import { IHasEntityType, IPropertyMetadata, ITypeDefinitionLoadingContext, SourceFile, TypeDefinition, isEntityReferencePropertyMetadata, isPropertiesArray } from "@/interfaces/metadata";
import { IObjectMetadataBuilder } from "@/utils/metadata/metadataBuilder";
import { EntitiesManager } from "./manager";
import { HttpClientApi } from "@/publicJsApis/httpClient";
import { EntityConfigurationDto } from "./models";
import { DataTypes } from "@/interfaces";
import { StringBuilder } from "@/utils/metadata/stringBuilder";
import { TypesImporter } from "@/utils/metadata/typesImporter";
import { getEntityIdJsType } from "@/utils/metadata";
import camelcase from "camelcase";
import { EOL } from "@/utils/metadata/models";

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
  entityConfigs.forEach((entityConfig) => {
    let moduleProp = result.find((m) => m.path === entityConfig.module.accessor);
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

    const propertyMetadata: IEntityPropertyMetadata & IHasEntityType = {
      path: entityConfig.accessor,
      label: entityConfig.name,
      description: entityConfig.description,
      dataType: DataTypes.entityReference,
      entityType: entityConfig.name,
      entityModule: entityConfig.module.name,
      properties: [],
      entityItemType: 'entityType',
      moduleAccessor: entityConfig.module.accessor,
    };
    if (!isPropertiesArray(moduleProp.properties))
      throw new Error("Something went wrong. Expected array of properties");

    moduleProp.properties.push(propertyMetadata);
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
  return EntitiesManager.fetchConfigurationsAsync(httpClient).then((res) => entitiesConfigurationToProperties(res));
};

const BASE_ENTITY_MODULE = "entities/interfaces.ts";

const createEntityBaseModels = (context: ITypeDefinitionLoadingContext): void => {
  const content = [
    "/*",
    " * Entity with typed id",
    " */",
    "export interface IEntity<TId = string> {",
    "    id: TId;",
    "};",
    "",
    "export interface IDeletionAuditedEntity {",
    "    /** Deleter User Id */",
    "    deleterUserId?: number;",
    "    /** Deletion Time */",
    "    deletionTime?: Date;",
    "    /** Is Deleted */",
    "    isDeleted: boolean;",
    "}",
    "",
    "export interface ICreationAuditedEntity {",
    "    /** Creation Time */",
    "    creationTime: Date;",
    "    /** Creator User Id */",
    "    creatorUserId?: number;",
    "}",
    "",
    "export interface IModificationAuditedEntity {",
    "    /** Last Modification Time */",
    "    lastModificationTime?: Date;",
    "    /** Last Modifier User Id */",
    "    lastModifierUserId?: number;",
    "}",
    "",
    "export interface IFullAudited extends IDeletionAuditedEntity, ICreationAuditedEntity, IModificationAuditedEntity { ",
    "",
    "}",
    "export interface IFullAuditedEntity<TId = string> extends IEntity<TId>, IFullAudited {",
    "",
    "}",
    "",
    "export type EntityCreatePayload<TId = string, TEntity extends IEntity<TId> = IEntity<TId>> = Omit<TEntity, keyof IFullAuditedEntity<TId>>;",
    "export type EntityUpdatePayload<TId = string, TEntity extends IEntity<TId> = IEntity<TId>> = Partial<Omit<TEntity, keyof IFullAudited>> & Pick<TEntity, \"id\">",
    "",
    "export interface IApiEndpoint {",
    "    /** Http verb (get/post/put etc) */",
    "    httpVerb: string;",
    "    /** Url */",
    "    url: string;",
    "  }",
    "",
    "export interface IEntityEndpoints extends Record<string, IApiEndpoint> {",
    "   create: IApiEndpoint;",
    "   read: IApiEndpoint;",
    "   update: IApiEndpoint;",
    "   delete: IApiEndpoint;",
    "}",
    "",
    "export interface EntityAccessor<TId = string, TEntity extends IEntity<TId> = IEntity<TId>> {",
    "    createAsync: (value: EntityCreatePayload<TId, TEntity>) => Promise<TEntity>;",
    "    getAsync: (id: TId) => Promise<TEntity>;",
    "    updateAsync: (value: EntityUpdatePayload<TId, TEntity>) => Promise<TEntity>;",
    "    deleteAsync: (id: TId) => Promise<void>;",
    "    getApiEndpointsAsync: () => Promise<IEntityEndpoints>;",
    "}"].join('\r\n');

  context.typeDefinitionBuilder.makeFile(BASE_ENTITY_MODULE, content);
};

const sortByPath = <TProp extends IPropertyMetadata = IPropertyMetadata>(arr: TProp[]): TProp[] => {
  return [...arr].sort((a, b) => a.path.localeCompare(b.path));
};

const entitiesConfigurationToTypeDefinition = async (configurations: EntityConfigurationDto[], context: ITypeDefinitionLoadingContext): Promise<TypeDefinition> => {
  const apiFile: SourceFile = {
    fileName: "apis/entitiesApi.d.ts",
    content: "",
  };
  const result: TypeDefinition = {
    typeName: "EntitiesApi",
    files: [apiFile],
  };

  createEntityBaseModels(context);

  const content = [
    `export interface ${result.typeName} {`,
  ];

  const typesBuilder = context.typeDefinitionBuilder;

  const getModuleTypeName = (property: IEntityPropertyMetadata): string => {
    return camelcase(property.path, { pascalCase: true });
  };

  const writeObject = async (sb: StringBuilder, typesImporter: TypesImporter, property: IEntityPropertyMetadata): Promise<void> => {
    if (property.description)
      sb.append(`/** ${property.description} */`);

    sb.append(`export interface ${getModuleTypeName(property)} {`);

    if (!isPropertiesArray(property.properties))
      throw new Error("Something went wrong. Entity properties should be an array of properties");

    sb.incIndent();

    let baseTypesImported = false;

    const sortedProps = sortByPath(property.properties);
    for (const prop of sortedProps) {
      if ((prop as IEntityPropertyMetadata).entityItemType === 'entityType' && isEntityReferencePropertyMetadata(prop)) {
        if (!baseTypesImported) {
          typesImporter.import({ typeName: "EntityAccessor", filePath: BASE_ENTITY_MODULE });
        }

        const typeDef = await typesBuilder.getEntityType({ name: prop.entityType, module: prop.entityModule });
        if (typeDef) {
          typesImporter.import(typeDef);

          const idType = getEntityIdJsType(typeDef.metadata);
          if (!idType)
            throw new Error(`Failed to find identifier type for entity '${prop.entityType}'`);

          if (prop.description)
            sb.append(`/** ${prop.description} */`);
          sb.append(`${prop.path}: EntityAccessor<${idType}, ${typeDef.typeName}>;`);
        } else {
          console.error(`Failed to find entity type '${prop.entityModule}/${prop.entityType}' for (property '${prop.path}')`);
          sb.append(`${prop.path}: any;`);
        }
      }
    }
    sb.decIndent();
    sb.append("}");
  };

  const typesImporter = new TypesImporter();
  const sb = new StringBuilder();
  sb.appendLines(content);

  const properties = entitiesConfigurationToProperties(configurations);

  sb.incIndent();

  const sortedProps = sortByPath(properties);
  for (const property of sortedProps) {
    // module
    const moduleSb = new StringBuilder();
    const moduleImporter = new TypesImporter();

    await writeObject(moduleSb, moduleImporter, property);

    const moduleExportSection = moduleSb.build();
    const moduleImportSection = moduleImporter.generateImports();
    const moduleContent = `${moduleImportSection}${EOL}${moduleExportSection}`;

    const moduleFileName = `entities/${property.path}/index.d.ts`;

    typesBuilder.makeFile(moduleFileName, moduleContent);

    const moduleType = getModuleTypeName(property);

    // entities Api
    typesImporter.import({ typeName: moduleType, filePath: moduleFileName });

    sb.append(`${property.path}: ${moduleType};`);
  }
  sb.decIndent();

  sb.append("}");

  const exportSection = sb.build();
  const importSection = typesImporter.generateImports();

  apiFile.content = `${importSection}${EOL}${exportSection}`;

  return result;
};

/**
 * Fetches the API type definition for entities using the provided HTTP client.
 *
 * @param {HttpClientApi} httpClient - The HTTP client used to make the API request.
 * @return {Promise<TypeDefinition>} A promise that resolves to the type definition of the entities API.
 */
const fetchEntitiesApiTypeDefinition = (context: ITypeDefinitionLoadingContext, httpClient: HttpClientApi): Promise<TypeDefinition> => {
  return EntitiesManager.fetchConfigurationsAsync(httpClient).then((res) => entitiesConfigurationToTypeDefinition(res, context));
};

/**
 * Returns a MetadataBuilder with properties loader and type definition set based on the provided MetadataBuilder and HttpClientApi.
 *
 * @param {MetadataBuilder} builder - the MetadataBuilder instance
 * @param {HttpClientApi} httpClient - the HttpClientApi instance
 * @return {MetadataBuilder} the MetadataBuilder instance with properties loader and type definition set
 */
export const getEntitiesApiProperties = (builder: IObjectMetadataBuilder, httpClient: HttpClientApi): IObjectMetadataBuilder => builder
  .setPropertiesLoader(() => fetchEntitiesApiAsMetadataProperties(httpClient))
  .setTypeDefinition((ctx) => fetchEntitiesApiTypeDefinition(ctx, httpClient));
