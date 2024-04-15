import { DataTypes, IReferenceListIdentifier } from "@/interfaces";
import { IHasEntityType, IObjectMetadata, IPropertyMetadata, ModelTypeIdentifier, PropertiesLoader, TypeDefinitionLoader, isEntityMetadata } from "@/interfaces/metadata";
import { StandardConstantInclusionArgs } from "./useAvailableConstants";

export interface IMetadataBuilder {

}

export type PropertiesBuilder = (builder: MetadataBuilder) => void;
export type MetadataFetcher = (typeId: ModelTypeIdentifier) => Promise<IObjectMetadata>;
export type MetadataBuilderAction = (builder: MetadataBuilder, name: string) => void;

export class MetadataBuilder implements IMetadataBuilder {
    readonly metadataFetcher: MetadataFetcher;
    readonly _standardProperties: Map<string, MetadataBuilderAction> = new Map<string, MetadataBuilderAction>();

    private metadata: IObjectMetadata = {
        dataType: DataTypes.object,
        properties: null,
    };

    constructor(metadataFetcher: MetadataFetcher, name: string, description?: string) {
        this.metadataFetcher = metadataFetcher;
        this.metadata.name = name;
        this.metadata.description = description;
    }

    registerStandardProperty(key: string, action: MetadataBuilderAction) {
        this._standardProperties.set(key, action);
    }

    _createProperty(dataType: string, path: string, label: string): IPropertyMetadata {
        const property: IPropertyMetadata = {
            dataType,
            path,
            label,
        };
        if (this.metadata.properties === null) {
            this.metadata.properties = [];
        } else if (!Array.isArray(this.metadata.properties))
            throw new Error("properties must be an array");

        this.metadata.properties.push(property);
        return property;
    }

    add(dataType: string, path: string, label: string) {
        this._createProperty(dataType, path, label);
        return this;
    }

    addString(path: string, label: string) {
        return this.add(DataTypes.string, path, label);
    }

    addNumber(path: string, label: string) {
        return this.add(DataTypes.number, path, label);
    }

    addDate(path: string, label: string) {
        return this.add(DataTypes.date, path, label);
    }

    addBoolean(path: string, label: string) {
        return this.add(DataTypes.boolean, path, label);
    }

    addArray(path: string, label: string) {
        this._createProperty(DataTypes.array, path, label);
        return this;
    }

    addCustom(path: string, label: string, typeDefinitionLoader: TypeDefinitionLoader) {
        const nestedObject = this._createProperty(DataTypes.object, path, label);
        nestedObject.typeDefinitionLoader = typeDefinitionLoader;
        return this;
    }

    addFunction(path: string, label: string){
        const nestedObject = this._createProperty(DataTypes.function, path, label);
        nestedObject.typeDefinitionLoader = (_ctx) => {
            return Promise.resolve({ typeName: '(...arguments: any) => any;', files: [] });
        };
        return this;
    }

    addObject(path: string, label: string, propertiesBuilder: PropertiesBuilder) {
        const nestedObject = this._createProperty(DataTypes.object, path, label);

        if (propertiesBuilder) {
            const builder = new MetadataBuilder(this.metadataFetcher, path);
            propertiesBuilder(builder);
            nestedObject.properties = builder.metadata.properties;
            nestedObject.typeDefinitionLoader = builder.metadata.typeDefinitionLoader;
        }

        return this;
    }

    addEntityAsync(path: string, label: string, entityType: string): Promise<this> {
        return this.metadataFetcher({ name: entityType, module: null }).then(response => {
            const nestedObject = this._createProperty(DataTypes.entityReference, path, label);
            nestedObject.dataFormat = entityType;

            if (!isEntityMetadata(response))
                throw new Error(`Failed to resolve entity type '${entityType}'`);

            const entityProperty = nestedObject as IHasEntityType;
            entityProperty.entityType = response.entityType;
            entityProperty.entityModule = response.entityModule;

            return this;
        });
    }
    addStandard(args: StandardConstantInclusionArgs | StandardConstantInclusionArgs[]): this {
        const itemsArr = Array.isArray(args) ? args : [args];
        itemsArr.forEach(item => {
            const key = typeof (item) === 'string'
                ? item
                : item.uid;
            const name = typeof (item) === 'string'
                ? undefined
                : item.name;
            this._standardProperties.get(key)?.(this, name);
        });
        return this;
    }
    addAllStandard(exclusions?: string[]): this {
        this._standardProperties.forEach((item, key) => {
            if (exclusions?.includes(key))
                return;
           item(this, undefined);
        });
        return this;
    }

    addRefList(path: string, refListId: IReferenceListIdentifier, label: string) {
        const property = this._createProperty(DataTypes.referenceListItem, path, label);
        property.referenceListModule = refListId.module;
        property.referenceListName = refListId.name;
        return this;
    }

    setPropertiesLoader(loader: PropertiesLoader) {
        if (this.metadata.properties)
            throw new Error("Properties loader can be set only once");

        this.metadata.properties = loader;
        return this;
    }

    setTypeDefinition(typeDefinitionLoader: TypeDefinitionLoader) {
        this.metadata.typeDefinitionLoader = typeDefinitionLoader;
        return this;
    }

    build(): IObjectMetadata {
        return this.metadata;
    }
}