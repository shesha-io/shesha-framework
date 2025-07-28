import { DataTypes, FormFullName } from "@/interfaces";
import {
    GenericTypeDeclaration,
    IArrayMetadata,
    IEntityMetadata,
    IHasEntityType,
    IMethodMetadata,
    IObjectMetadata,
    IPropertyMetadata,
    ITypeDefinitionBuilder,
    ModelTypeIdentifier,
    NestedProperties,
    TypeAndLocation,
    TypeDefinition,
    TypeImport,
    isEntityMetadata,
    isIHasEntityType,
    isPropertiesArray,
    isPropertiesLoader
} from "@/interfaces/metadata";
import camelcase from "camelcase";
import { isEmptyString, verifiedCamelCase } from "../string";
import { StringBuilder } from "./stringBuilder";
import { TypesImporter } from "./typesImporter";
import { MetadataFetcher } from "./metadataBuilder";
import { CODE, entitiesCode } from "@/publicJsApis";
import { Environment } from "@/publicJsApis/metadataBuilder";
import { EOL } from "./models";

export interface BuildResult {
    content: string;
}
export interface BuildContext {
    requestedFiles: string[];
}

type OnUseComplexTypeHandler = (typeImport: TypeImport) => void;
export type BuildTypeContext = {
    environment?: Environment;
    onUseComplexType?: OnUseComplexTypeHandler;
};

type TypeBuildRequest = {
    typeAccessor: string;
    typesImporter: TypesImporter;
    metadata: IEntityMetadata;
    fileName: string;
};
type CommonTypeBuildRequest = TypeBuildRequest & {
    backEndTypeName: string;
};

type AsyncPropertyHandler = (property: IPropertyMetadata) => Promise<void>;
/**
 * Type definition builder
 */
export class TypesBuilder implements ITypeDefinitionBuilder {
    readonly isFileExists: (fileName: string) => boolean;
    readonly registerFile: (fileName: string, content: string) => void;
    readonly metadataFetcher: MetadataFetcher;
    readonly requestedEntities: Set<string> = new Set();

    constructor(metadataFetcher: MetadataFetcher, isFileExists: (fileName: string) => boolean, registerFile: (fileName: string, content: string) => void) {
        this.metadataFetcher = metadataFetcher;
        this.isFileExists = isFileExists;
        this.registerFile = registerFile;
    }

    #internalRegisterFile = (fileName: string, content: string) => {
        // note: in some cases we have to double check existence of the file because it may be registered recursively
        if (!this.isFileExists(fileName))
            this.registerFile(fileName, content);
    };

    /**
     * Asynchronously iterates through the properties and handles each property using the provided property handler.
     *
     * @param {NestedProperties} properties - the properties to iterate through
     * @param {AsyncPropertyHandler} propertyHandler - the handler function for each property
     * @return {Promise<void>} a promise that resolves once all properties have been handled
     */
    async #iterateProperties(properties: NestedProperties, propertyHandler: AsyncPropertyHandler): Promise<void> {
        if (!properties)
            return;

        const loadedProperties = isPropertiesArray(properties)
            ? properties
            : isPropertiesLoader(properties)
                ? await properties()
                : [];
        const sortedProperties = loadedProperties.sort((a, b) => a.path.localeCompare(b.path));

        for (const prop of sortedProperties) {
            await propertyHandler(prop);
        }
    };

    getEntityTypeName = (entityType: string): string => {
        return camelcase(entityType, { pascalCase: true });
    };

    #getEntityFileName = (typeAccessor: string, moduleAccessor?: string): string => {
        const folder = moduleAccessor ?? "[no-module]";
        return `entities/${folder}/${typeAccessor}.ts`;
    };

    #appendCommentBlock = (sb: StringBuilder, lines: string[]) => {
        const filteredLines = lines.filter(l => Boolean(l));
        if (filteredLines.length > 0) {
            filteredLines.forEach((line, index) => {
                const prefix = index === 0 ? '/**' : ' *';
                const suffix = index === filteredLines.length - 1 ? ' */' : '';
                line = `${prefix} ${line}${suffix}`;
                sb.append(line);
            });
        }
    };

    makeFormType = (formId: FormFullName, content: string): TypeDefinition => {
        const formModelFileName = `forms/${formId.module}/${formId.name}/model.ts`;
        const definition: TypeDefinition = {
            typeName: 'FormModel',
            files: [{ content, fileName: formModelFileName }],
        };
        return definition;
    };

    makeFile = (fileName: string, content: string) => {
        this.#internalRegisterFile(fileName, content);
    };

    makeEntitiesBaseTypes = () => {
        this.makeFile(CODE.ENTITY_BASE_TYPES_PATH, entitiesCode);
    };

    buildCommonTypeAsync = async (request: CommonTypeBuildRequest): Promise<string> => {
        const { typeAccessor, typesImporter, metadata, fileName, backEndTypeName } = request;
        const sb = new StringBuilder();

        typesImporter.import({ typeName: CODE.ENVIRONMENT_TYPE, filePath: CODE.ENTITY_BASE_TYPES_PATH });

        this.#appendCommentBlock(sb, [metadata.entityType, metadata.description]);
        sb.append(`export type ${typeAccessor}<Env extends ${CODE.ENVIRONMENT_TYPE} = ${CODE.ENVIRONMENT_TYPE}.None> = {`);
        sb.incIndent();
        await this.#iterateProperties(metadata.properties, async (prop) => {
            const propertyName = verifiedCamelCase(prop.path);
            const dataType = await this.#getTypescriptType(prop, {
                onUseComplexType: (typeInfo) => {
                    typesImporter.import({ typeName: typeInfo.typeName, filePath: typeInfo.filePath });
                }
            });

            if (dataType) {
                if (dataType.filePath !== fileName)
                    typesImporter.import(dataType);

                const isEntity = dataType.metadata && isEntityMetadata(dataType.metadata);
                const typeName = isEntity
                    ? `${dataType.typeName}<Env>`
                    : dataType.typeName;

                this.#appendCommentBlock(sb, [prop.label, prop.description]);
                sb.append(`${propertyName}${prop.isNullable ? '?' : ''}: ${typeName};`);
            }
        });
        sb.decIndent();
        if (backEndTypeName) {
            sb.append(`& (Env extends Environment.BackEnd ? ${backEndTypeName} : {});`);
        } else {
            sb.append("};");
        }
        return sb.build();
    };

    #makeAsync = (typeName: string, isAsync: boolean): string => {
        return isAsync
            ? `Promise<${typeName}>`
            : typeName;
    };

    #buildMethodReturnTypeAsync = async (method: IMethodMetadata, typesImporter: TypesImporter): Promise<string> => {
        const returnType: TypeAndLocation = method.returnType
            ? await this.#getTypescriptType(method.returnType)
            : undefined;

        if (returnType?.filePath)
            typesImporter.import(returnType);

        const typeName = returnType?.typeName ?? 'void';
        return this.#makeAsync(typeName, method.isAsync);
    };

    #buildMethodArgumentsAsync = async (method: IMethodMetadata, _typesImporter: TypesImporter): Promise<string> => {
        // TODO: implement arguments support
        return method.arguments && method.arguments.length > 0
            ? 'args: any'
            : '';
    };

    buildBackEndTypeAsync = async (request: TypeBuildRequest): Promise<string> => {
        const { typeAccessor, metadata, typesImporter } = request;

        // TODO: implement arguments support
        //const supportedMethods = (metadata.methods ?? []).filter(m => !m.arguments || m.arguments.length === 0);
        const supportedMethods = metadata.methods ?? [];
        if (supportedMethods.length === 0)
            return undefined;

        const sb = new StringBuilder();
        sb.append(`export type ${typeAccessor} = {`);
        sb.incIndent();
        for (const method of supportedMethods) {
            const methodName = verifiedCamelCase(method.name);

            const returnType = await this.#buildMethodReturnTypeAsync(method, typesImporter);
            const methodArgs = await this.#buildMethodArgumentsAsync(method, typesImporter);

            sb.append(`${methodName}: (${methodArgs}) => ${returnType};`);
        }
        sb.decIndent();
        sb.append("};");
        return sb.build();
    };

    #getEnvironmentSpecificEntityTypeDeclaration = (typeName: string, environment: Environment): GenericTypeDeclaration => {
        const envName = environment === Environment.BackEnd
            ? CODE.ENVIRONMENT_BACK_END
            : environment === Environment.FrontEnd
                ? CODE.ENVIRONMENT_FRONT_END
                : undefined;
        return !envName
            ? undefined
            : {
                typeDeclaration: `${typeName}<${envName}>`,
                dependencies: [{ typeName: CODE.ENVIRONMENT_TYPE, filePath: CODE.ENTITY_BASE_TYPES_PATH }]
            };
    };

    getEntityType = async (typeId: ModelTypeIdentifier, context?: BuildTypeContext): Promise<TypeAndLocation> => {
        if (!typeId)
            return null;

        const entityMetadata = await this.metadataFetcher(typeId);
        if (!isEntityMetadata(entityMetadata))
            throw new Error(`Specified type is not an entity: ${typeId}`);

        const { typeAccessor, moduleAccessor } = entityMetadata;
        if (!moduleAccessor)
            return null;

        const fileName = this.#getEntityFileName(typeAccessor, moduleAccessor);
        const typeName = typeAccessor;
        const fullName = `${moduleAccessor}/${typeAccessor}`;

        if (this.requestedEntities.has(fullName))
            return { typeName: typeAccessor, filePath: fileName, metadata: entityMetadata };
        this.requestedEntities.add(fullName);

        if (this.isFileExists(fileName))
            return { typeName: typeAccessor, filePath: fileName, metadata: entityMetadata };

        // import base interfaces
        this.makeEntitiesBaseTypes();

        const typesImporter = new TypesImporter();

        const buildRequest: TypeBuildRequest = {
            typesImporter,
            typeAccessor,
            metadata: entityMetadata,
            fileName: fileName
        };
        const backEndType = `${typeAccessor}Backend`;
        const backEndCode = await this.buildBackEndTypeAsync({ ...buildRequest, typeAccessor: backEndType });
        const commonTypeCode = await this.buildCommonTypeAsync({
            ...buildRequest,
            backEndTypeName: backEndCode ? backEndType : undefined
        });

        const importSection = typesImporter.generateImports();

        const content = [importSection, backEndCode, commonTypeCode].filter(x => x).join(EOL);

        this.makeFile(fileName, content);

        const envSpecificDeclaration = this.#getEnvironmentSpecificEntityTypeDeclaration(typeAccessor, context?.environment);
        return {
            typeName: typeName,
            filePath: fileName,
            metadata: entityMetadata,
            ...envSpecificDeclaration
        };
    };

    #getTypeIdentifier = (property: IPropertyMetadata): ModelTypeIdentifier => {
        const { dataFormat } = property;
        // TODO: merge entityType and dataFormat
        const entityType = (property as IHasEntityType).entityType ?? dataFormat;

        if (!entityType)
            return null;

        if (isIHasEntityType(property) && entityType) {
            return {
                name: entityType,
                module: property.entityModule,
            };
        } else
            return null;
    };

    buildArrayType = async (property: IArrayMetadata, context?: BuildTypeContext): Promise<TypeAndLocation> => {
        return await this.#getArrayType(property, context);
    };

    #getArrayType = async (property: IPropertyMetadata, context?: BuildTypeContext): Promise<TypeAndLocation> => {
        switch (property.dataFormat) {
            case DataTypes.entityReference: {
                if (isIHasEntityType(property)) {
                    const itemTypeFixed: IPropertyMetadata & IHasEntityType = {
                        path: 'item',
                        dataType: DataTypes.entityReference,
                        //dataFormat: property.entityType,
                        entityType: property.entityType,
                    };
                    const itemType = await this.#getTypescriptType(itemTypeFixed);

                    if (itemType?.typeName) {
                        if (itemType.filePath && context?.onUseComplexType)
                            context.onUseComplexType({ typeName: itemType.typeName, filePath: itemType.filePath });
                        return { typeName: `${itemType.typeName}[]` };
                    } else {
                        console.warn(`Failed to build type ${property.entityType}`, property);
                    }
                }
                break;
            }
            case DataTypes.referenceListItem: {
                return { typeName: `number[]` };
            }
        }

        if (property.itemsType) {
            const itemTypeFixed = { ...property.itemsType, path: property.itemsType['name'] ?? property.itemsType.path };
            const itemType = await this.#getTypescriptType(itemTypeFixed);

            if (itemType) {
                if (itemType.filePath && context?.onUseComplexType)
                    context.onUseComplexType({ typeName: itemType.typeName, filePath: itemType.filePath });
                return { typeName: `${itemType.typeName}[]` };
            }
        }

        return { typeName: "any[]" };
    };

    #getEntityPropertyType = async (property: IPropertyMetadata, context?: BuildTypeContext): Promise<TypeAndLocation> => {
        const typeId = this.#getTypeIdentifier(property);
        return await this.getEntityType(typeId, context);
    };

    #generateFileName = (keyType: string) => {
        return `apis/${camelcase(keyType)}.ts`;
    };

    #getObjectType = async (propertyName: string, properties: NestedProperties): Promise<TypeAndLocation> => {
        if (!properties || properties.length === 0) {
            return { typeName: "{ [key: string]: any }" };
        }
        const typeName = camelcase(propertyName, { pascalCase: true });
        const fileName = this.#generateFileName(typeName);

        const typesImporter = new TypesImporter();

        if (!this.isFileExists(fileName)) {
            const sb = new StringBuilder();
            sb.append(`export interface ${typeName} {`);
            sb.incIndent();
            await this.#iterateProperties(properties, async (prop) => {
                const dataType = await this.#getTypescriptType(prop);
                if (dataType) {
                    typesImporter.import(dataType);
                    sb.append(`${prop.path}${prop.isNullable ? '?' : ''}: ${dataType.typeName};`);
                }
            });
            sb.decIndent();
            sb.append("}");
            const exportSection = sb.build();

            const importSection = typesImporter.generateImports();
            const content = importSection
                ? `${importSection}${EOL}${exportSection}`
                : exportSection;

            this.makeFile(fileName, content);
        }

        return { typeName, filePath: fileName };
    };

    #getTypescriptType = async (property: IPropertyMetadata, context?: BuildTypeContext): Promise<TypeAndLocation> => {
        if (property.typeDefinitionLoader) {
            const definition = await property.typeDefinitionLoader({ typeDefinitionBuilder: this });

            definition.files.forEach(file => {
                this.makeFile(file.fileName, file.content);
            });
            const fileName = definition.files.length > 0
                ? definition.files[0].fileName
                : undefined;

            return { typeName: definition.typeName, filePath: fileName };
        }

        switch (property.dataType) {
            case DataTypes.boolean:
                return { typeName: 'boolean' };
            case DataTypes.number:
            case DataTypes.referenceListItem:
                return { typeName: 'number' };
            case DataTypes.string:
            case DataTypes.guid:
                return { typeName: 'string' };
            case DataTypes.date:
                return { typeName: 'Date' };
            case DataTypes.dateTime:
                return { typeName: 'Date' };
            case DataTypes.any:
                return { typeName: 'any' };
            case DataTypes.entityReference:
                return await this.#getEntityPropertyType(property, context);
            case DataTypes.object:
                return await this.#getObjectType(property.path, property.properties);
            case DataTypes.array:
                return await this.#getArrayType(property, context);
            default:
                return undefined;
        }
    };

    #getDataTypeDeclaration = (dataType: TypeAndLocation, isNullable: boolean): string => {
        const type = dataType.typeDeclaration ? dataType.typeDeclaration : dataType.typeName;

        return isNullable
            ? `${type} | null`
            : type;
    };

    /**
     * Build type definition for specified list of properties
     */
    async buildConstants(properties: NestedProperties, context?: BuildTypeContext): Promise<BuildResult> {
        const typesImporter = new TypesImporter();
        const sb = new StringBuilder();

        await this.#iterateProperties(properties, async (prop) => {
            const dataType = await this.#getTypescriptType(prop, context);
            if (dataType) {
                typesImporter.import(dataType);

                this.#appendCommentBlock(sb, [prop.label, prop.description]);

                typesImporter.importAll(dataType.dependencies);
                const typeDefinition = this.#getDataTypeDeclaration(dataType, prop.isNullable);

                sb.append(`export const ${prop.path}: ${typeDefinition};`);
            }
        });

        const exportSection = sb.build();

        const importSection = typesImporter.generateImports();

        const result: BuildResult = {
            content: importSection && !isEmptyString(importSection)
                ? `${importSection}${EOL}${exportSection}`
                : exportSection,
        };
        return result;
    }

    getBaseType = async (metadata: IObjectMetadata): Promise<TypeAndLocation> => {
        const { typeDefinitionLoader } = metadata;
        if (!typeDefinitionLoader)
            return undefined;

        const definition = await typeDefinitionLoader({ typeDefinitionBuilder: this });

        definition.files.forEach(file => {
            this.makeFile(file.fileName, file.content);
        });

        const fileName = definition.files.length > 0
            ? definition.files[0].fileName
            : undefined;

        return { typeName: definition.typeName, filePath: fileName };
    };

    async buildType(metadata: IObjectMetadata): Promise<BuildResult> {
        const { name: typeName, properties } = metadata;

        const typesImporter = new TypesImporter();

        const baseTypeDef = await this.getBaseType(metadata);
        const extendsClause = baseTypeDef?.typeName
            ? `extends ${baseTypeDef.typeName} `
            : "";
        if (baseTypeDef)
            typesImporter.import(baseTypeDef);

        const sb = new StringBuilder();
        sb.append(`export interface ${typeName} ${extendsClause}{`);
        sb.incIndent();
        await this.#iterateProperties(properties, async (prop) => {
            const dataType = await this.#getTypescriptType(prop);
            if (dataType) {
                typesImporter.import(dataType);
                this.#appendCommentBlock(sb, [prop.label, prop.description]);
                sb.append(`${prop.path}${prop.isNullable ? '?' : ''}: ${dataType.typeName};`);
            }
        });
        sb.decIndent();
        sb.append("}");
        const exportSection = sb.build();

        const importSection = typesImporter.generateImports();
        const content = importSection
            ? `${importSection}${EOL}${exportSection}`
            : exportSection;

        const result: BuildResult = {
            content,
        };
        return result;
    }
}