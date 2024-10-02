import { DataTypes, IReferenceListIdentifier } from "@/interfaces";
import { IHasEntityType, IObjectMetadata, IPropertyMetadata, ModelTypeIdentifier, PropertiesLoader, TypeDefinition, TypeDefinitionLoader, isEntityMetadata } from "@/interfaces/metadata";
import { PropertiesBuilder, StandardConstantInclusionArgs } from "@/publicJsApis/metadataBuilder";
import { registerMetadataBuilderAction } from "./standardProperties";
import { 
    IMetadataBuilder as IPublicMetadataBuilder,
    IObjectMetadataBuilder as IPublicObjectMetadataBuilder,
} from '@/publicJsApis/metadataBuilder';

import { IMetadata } from '@/publicJsApis/metadata';
import { metadataSourceCode } from '@/publicJsApis';

export interface IObjectMetadataBuilder extends IPublicObjectMetadataBuilder {
    // internal methods
    addCustom(path: string, label: string, typeDefinitionLoader: TypeDefinitionLoader): this;
    addFunction(path: string, label: string): this;
    addRefList(path: string, refListId: IReferenceListIdentifier, label: string): this;
    setPropertiesLoader(loader: PropertiesLoader): this;
    setProperties(properties: IPropertyMetadata[]);
    setTypeDefinition(typeDefinitionLoader: TypeDefinitionLoader): this;
}

export interface IMetadataBuilder extends IPublicMetadataBuilder<IObjectMetadataBuilder> {
}

export type MetadataFetcher = (typeId: ModelTypeIdentifier) => Promise<IObjectMetadata>;
export type MetadataBuilderAction = (builder: IObjectMetadataBuilder, name: string) => void;

export type WellKnownConstantDescriptor = {
    includeByDefault: boolean;
    buildAction: MetadataBuilderAction;
};

export interface IMetadataBuilderInternal extends IMetadataBuilder {
    readonly metadataFetcher: MetadataFetcher;
    readonly standardProperties: Map<string, WellKnownConstantDescriptor>;
}

export class ObjectMetadataBuilder implements IObjectMetadataBuilder {
    #metadataBuilder: IMetadataBuilderInternal;
    private metadata: IObjectMetadata = {
        dataType: DataTypes.object,
        properties: null,
    };

    constructor(metadataBuilder: IMetadataBuilderInternal, name: string, description?: string) {
        this.#metadataBuilder = metadataBuilder;
        this.metadata.name = name;
        this.metadata.description = description;
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

    addFunction(path: string, label: string) {
        const nestedObject = this._createProperty(DataTypes.function, path, label);
        nestedObject.typeDefinitionLoader = (_ctx) => {
            return Promise.resolve({ typeName: '(...arguments: any) => any;', files: [] });
        };
        return this;
    }

    addObject(path: string, label: string, propertiesBuilder: PropertiesBuilder<this>) {
        const nestedObject = this._createProperty(DataTypes.object, path, label);

        if (propertiesBuilder) {
            const builder = new ObjectMetadataBuilder(this.#metadataBuilder, path) as this;
            propertiesBuilder(builder);
            nestedObject.properties = builder.metadata.properties;
            nestedObject.typeDefinitionLoader = builder.metadata.typeDefinitionLoader;
        }

        return this;
    }

    addEntityAsync(path: string, label: string, entityType: string): Promise<this> {
        return this.#metadataBuilder.metadataFetcher({ name: entityType, module: null }).then(response => {
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
            const descriptor = this.#metadataBuilder.standardProperties.get(key);
            if (descriptor)
                descriptor.buildAction?.(this, name);
        });
        return this;
    }
    addAllStandard(exclusions?: string[]): this {
        this.#metadataBuilder.standardProperties.forEach((item, key) => {
            if (exclusions?.includes(key) || !item.includeByDefault)
                return;

            item.buildAction(this, undefined);
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

    setProperties(properties: IPropertyMetadata[]) {
        if (this.metadata.properties)
            throw new Error("Properties can be set only once");

        this.metadata.properties = [...properties];
    }

    setTypeDefinition(typeDefinitionLoader: TypeDefinitionLoader) {
        this.metadata.typeDefinitionLoader = typeDefinitionLoader;
        return this;
    }

    addMetadataBuilder() {
        registerMetadataBuilderAction(this, 'metadataBuilder');
        return this;
    }

    build(): IObjectMetadata {
        return this.metadata;
    }
}

const getMetadataTypeDefinition: TypeDefinitionLoader = (): Promise<TypeDefinition> => {
    return Promise.resolve({
        typeName: "IMetadata",
        files: [{
            content: metadataSourceCode,
            fileName: "apis/metadata.d.ts",
        }],        
    });
};

export class MetadataBuilder implements IMetadataBuilderInternal {
    readonly metadataFetcher: MetadataFetcher;
    readonly standardProperties: Map<string, WellKnownConstantDescriptor> = new Map<string, WellKnownConstantDescriptor>();

    constructor(metadataFetcher: MetadataFetcher) {
        this.metadataFetcher = metadataFetcher;
    }
    simpleType(): IMetadata {
        throw new Error("Method not implemented.");
    }
    entity(entityType: string): Promise<IObjectMetadata> {
        return this.metadataFetcher({ name: entityType, module: null });
    }
    anyObject = (): IMetadata => ({ dataType: 'any' });
    string = (): IMetadata => ({ dataType: 'string' });
    number = (): IMetadata => ({ dataType: 'number' });
    date = (): IMetadata => ({ dataType: 'date' });
    boolean = (): IMetadata => ({ dataType: 'boolean' });

    metadata(): IObjectMetadata {
        return this.object("IMetadata").setTypeDefinition(getMetadataTypeDefinition).build();
    }

    object = (name: string, description?: string): IObjectMetadataBuilder => {
        return new ObjectMetadataBuilder(this, name, description);
    };

    registerStandardProperty(key: string, buildAction: MetadataBuilderAction, includeByDefault = true) {
        this.standardProperties.set(key, { buildAction, includeByDefault });
    }

    isEntityAsync(entityType: string): Promise<boolean> {
        return this.metadataFetcher({ name: entityType, module: null }).then(response => {
            return isEntityMetadata(response);
        });
    }
}