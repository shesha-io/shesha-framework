import { MetadataSourceType } from "./metadata";

export interface IModelItem {
    id: string;
    /**
     * Property Name
     */
    name?: string | null;
    /**
     * Label (display name)
     */
    label?: string | null;
    /**
     * Description
     */
    description?: string | null;
    /**
     * Data type
     */
    dataType?: string | null;
    /**
     * Data format
     */
    dataFormat?: string | null;
    /**
     * Entity type. Aplicable for entity references
     */
    entityType?: string | null;
    /**
     * Reference list name
     */
    referenceListName?: string | null;
    /**
     * Reference list module
     */
    referenceListModule?: string | null;

    source?: MetadataSourceType;

    suppress?: boolean;
    
    properties?: IModelItem[];

    /**
    * If true, indicates that current property is a framework-related (e.g. Abp.Domain.Entities.ISoftDelete.IsDeleted, Abp.Domain.Entities.Auditing.IHasModificationTime.LastModificationTime)
    */
    isFrameworkRelated?: boolean;
}