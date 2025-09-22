import { MetadataSourceType, ModelTypeIdentifier } from './metadata';

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
  dataType: string;
  /**
   * Data format
   */
  dataFormat?: string | null;
  /**
   * Entity type. Aplicable for entity references
   */
  entityType?: string | null;
  /**
   * Reference list Id
   */
  referenceListId?: ModelTypeIdentifier | null;

  source?: MetadataSourceType;

  suppress?: boolean;

  properties?: IModelItem[];

  itemsType?: IModelItem;

  isItemsType?: boolean;

  isChildProperty?: boolean;

  /**
   * If true, indicates that current property is a framework-related (e.g. Abp.Domain.Entities.ISoftDelete.IsDeleted, Abp.Domain.Entities.Auditing.IHasModificationTime.LastModificationTime)
   */
  isFrameworkRelated?: boolean;

  columnName?: string;
  createdInDb?: boolean;
  inheritedFromId?: string;
}
