import { DataTypes, FormFullName } from "@/interfaces";
import { IHasEntityType, IPropertyMetadata, ITypeDefinitionBuilder, ModelTypeIdentifier, NestedProperties, TypeAndLocation, TypeDefinition, isEntityMetadata, isIHasEntityType, isPropertiesArray, isPropertiesLoader } from "@/interfaces/metadata";
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

    #getEntityFileName = (typeAccessor: string, moduleAccessor?: string): string => {
        const folder = moduleAccessor ?? "[no-module]";
        return `entities/${folder}/${typeAccessor}.ts`;
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
            return { typeName: typeAccessor, filePath: fileName };
        this.requestedEntities.add(fullName);

        if (this.isFileExists(fileName))
            return { typeName: typeAccessor, filePath: fileName };

        const typesImporter = new TypesImporter();
        const sb = new StringBruilder();
        this.#appendCommentBlock(sb, [entityMetadata.entityType, entityMetadata.description]);
        sb.append(`export interface ${typeAccessor} {`);
        sb.incIndent();
        await this.#iterateProperties(entityMetadata.properties, async (prop) => {
            const propertyName = verifiedCamelCase(prop.path);
            const dataType = await this.#getTypescriptType(prop);

            if (dataType) {
                if (dataType.filePath !== fileName)
                    typesImporter.import(dataType);

                this.#appendCommentBlock(sb, [prop.label, prop.description]);
                sb.append(`${propertyName}${prop.isNullable ? '?' : ''}: ${dataType.typeName};`);
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

    #getTypeIdentifier = (property: IPropertyMetadata): ModelTypeIdentifier => {
        const { dataFormat } = property;
        // todo: merge entityType and dataFormat
        const entityType = (property as IHasEntityType).entityType ?? dataFormat;

        if (!entityType)
            return null;

        if (isIHasEntityType(property) && entityType){
            return { 
                name: entityType,
                module: property.entityModule,
                //module: property.moduleAccessor, 
                //name: property.typeAccessor                 
            };
        } else
            return null;
    };

    #getArrayType = async (_property: IPropertyMetadata): Promise<TypeAndLocation> => {
        return { typeName: "any[]" };
        /* todo: add context and import required types
        if (property.itemsType){
            const itemType = await this.#getTypescriptType(property.itemsType);

            return { typeName: `Array<${itemType.typeName}>` };
        } else {
            return { typeName: "any[]" };
        } 
        */       
    };

    #getEntityPropertyType = async (property: IPropertyMetadata): Promise<TypeAndLocation> => {
        const typeId = this.#getTypeIdentifier(property);
        return await this.getEntityType(typeId);
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
            const sb = new StringBruilder();
            sb.append(`export interface ${typeName} {`);
            sb.incIndent();
            await this.#iterateProperties(properties, async (prop) => {
                const dataType = await this.#getTypescriptType(prop);
                if (dataType){
                    typesImporter.import(dataType);
                    sb.append(`${prop.path}${prop.isNullable ? '?' : ''}: ${dataType.typeName};`);
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
            case DataTypes.array:
                return await this.#getArrayType(property);
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

                const typeDefinition = dataType.typeName + (prop.isNullable ? ' | null' : '');
                sb.append(`export const ${prop.path}: ${typeDefinition};`);
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