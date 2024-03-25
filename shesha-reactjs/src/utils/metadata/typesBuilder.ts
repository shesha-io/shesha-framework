import { DataTypes, FormFullName } from "@/interfaces";
import { IHasEntityType, IPropertyMetadata, ITypeDefinitionBuilder, ModelTypeIdentifier, NestedProperties, TypeAndLocation, TypeDefinition, isPropertiesArray, isPropertiesLoader } from "@/interfaces/metadata";
import camelcase from "camelcase";
import { verifiedCamelCase } from "../string";
import { StringBruilder } from "./stringBruilder";
import { TypesImporter } from "./typesImporter";
import { MetadataFetcher } from "./metadataBuilder";

export interface BuildResult {
    content: string;
}
export interface BuildContext {
    requestedFiles: string[];
}

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

        const promises = loadedProperties.map(prop => propertyHandler(prop));
        await Promise.all(promises);
    };

    getEntityTypeName = (entityType: string): string => {
        return camelcase(entityType, { pascalCase: true });
    };

    #getEntityFileName = (entityType: string, entityModule?: string): string => {
        const folder = entityModule ?? "[no-module]";
        return `entities/${folder}/${entityType}.ts`;
    };

    #appendCommentBlock = (sb: StringBruilder, lines: string[]) => {
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

    getEntityType = async (typeId: ModelTypeIdentifier): Promise<TypeAndLocation> => {
        if (!typeId)
            return null;

        const { module: entityModule, name: entityType } = typeId;
        const entityMetadata = await this.metadataFetcher(typeId);

        const fileName = this.#getEntityFileName(entityType, entityModule);
        const typeName = this.getEntityTypeName(entityType);

        if (this.requestedEntities.has(entityType))
            return { typeName, filePath: fileName };
        this.requestedEntities.add(entityType);

        if (this.isFileExists(fileName))
            return { typeName, filePath: fileName };

        const typesImporter = new TypesImporter();
        const sb = new StringBruilder();
        this.#appendCommentBlock(sb, [entityType]);
        sb.append(`export interface ${typeName} {`);
        sb.incIndent();
        await this.#iterateProperties(entityMetadata.properties, async (prop) => {
            const propertyName = verifiedCamelCase(prop.path);
            const dataType = await this.#getTypescriptType(prop);

            if (dataType) {
                if (dataType.filePath !== fileName)
                    typesImporter.import(dataType);

                this.#appendCommentBlock(sb, [prop.label, prop.description]);
                sb.append(`${propertyName}: ${dataType.typeName};`);
            }
        });
        sb.decIndent();
        sb.append("}");
        const exportSection = sb.build();

        const importSection = typesImporter.generateImports();
        const content = importSection
            ? `${importSection}\n\n${exportSection}`
            : exportSection;

        this.#internalRegisterFile(fileName, content);

        return { typeName, filePath: fileName };
    };

    #getEntityPropertyType = async (property: IPropertyMetadata): Promise<TypeAndLocation> => {
        const { dataFormat } = property;
        // todo: merge entityType and dataFormat
        const entityType = (property as IHasEntityType).entityType ?? dataFormat;

        if (!entityType)
            return null;

        const entityModule = (property as IHasEntityType).entityModule;

        return await this.getEntityType({ module: entityModule, name: entityType });
    };

    #generateFileName = (keyType: string) => {
        return `apis/${camelcase(keyType)}.ts`;
    };

    #getObjectType = async (propertyName: string, properties: NestedProperties): Promise<TypeAndLocation> => {
        const typeName = camelcase(propertyName, { pascalCase: true });
        const fileName = this.#generateFileName(typeName);
        if (!this.isFileExists(fileName)) {
            const sb = new StringBruilder();
            sb.append(`export interface ${typeName} {`);
            sb.incIndent();
            await this.#iterateProperties(properties, async (prop) => {
                const dataType = await this.#getTypescriptType(prop);
                if (dataType)
                    sb.append(`${prop.path}: ${dataType.typeName};`);
            });
            sb.decIndent();
            sb.append("}");
            const content = sb.build();

            this.#internalRegisterFile(fileName, content);
        }

        return { typeName, filePath: fileName };
    };

    #getTypescriptType = async (property: IPropertyMetadata): Promise<TypeAndLocation> => {
        if (property.typeDefinitionLoader) {
            const definition = await property.typeDefinitionLoader({ typeDefinitionBuilder: this });

            definition.files.forEach(file => {
                this.#internalRegisterFile(file.fileName, file.content);
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
                return { typeName: 'number' };
            case DataTypes.string:
                return { typeName: 'string' };
            case DataTypes.date:
                return { typeName: 'Date' };
            case DataTypes.dateTime:
                return { typeName: 'Date' };
            case DataTypes.entityReference:
                return await this.#getEntityPropertyType(property);
            case DataTypes.object:
                return await this.#getObjectType(property.path, property.properties);
            default:
                return undefined;
        }
    };

    /**
     * Build type definition for specified list of properties
     */
    async build(properties: NestedProperties): Promise<BuildResult> {
        const typesImporter = new TypesImporter();
        const sb = new StringBruilder();

        await this.#iterateProperties(properties, async (prop) => {
            const dataType = await this.#getTypescriptType(prop);
            if (dataType) {
                typesImporter.import(dataType);

                this.#appendCommentBlock(sb, [prop.label, prop.description]);
                sb.append(`export const ${prop.path}: ${dataType.typeName};`);
            }
        });
        const exportSection = sb.build();

        const importSection = typesImporter.generateImports();

        const result: BuildResult = {
            content: `${importSection}\n\n${exportSection}`,
        };
        return result;
    }
}