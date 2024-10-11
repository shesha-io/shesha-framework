export interface IMetadata {
    dataType: string;
    name?: string;
    description?: string;
}

export interface IMemberType {
    dataType?: string | null;
    dataFormat?: string | null;
    baseType?: IMemberType;
}

export interface IMemberMetadata extends IMemberType {
    path?: string | null;
    label?: string | null;
    description?: string | null;
}

export interface IPropertyMetadata extends IMemberMetadata {
    required?: boolean;
    readonly?: boolean;
    minLength?: number | null;
    maxLength?: number | null;
    min?: number | null;
    max?: number | null;
    validationMessage?: string | null;
    referenceListName?: string | null;
    referenceListModule?: string | null;
    /**
     * Child properties, applicable for complex data types (e.g. object, array)
     */
    properties?: NestedProperties;

    /**
     * If true, indicates that current property is a framework-related (e.g. Abp.Domain.Entities.ISoftDelete.IsDeleted, Abp.Domain.Entities.Auditing.IHasModificationTime.LastModificationTime)
     */
    isFrameworkRelated?: boolean;
    /**
     * If true, indicates that current property is nullable
     */
    isNullable?: boolean;
    prefix?: string;
    isVisible?: boolean;
    itemsType?: IPropertyMetadata;
}

export type PropertiesPromise = Promise<IPropertyMetadata[]>;
export type PropertiesLoader = () => PropertiesPromise;

export type NestedProperties = IPropertyMetadata[] | PropertiesLoader | null;

export interface IContainerWithNestedProperties {
    properties: NestedProperties;
}

export interface IObjectMetadata extends IMetadata, IContainerWithNestedProperties {

}