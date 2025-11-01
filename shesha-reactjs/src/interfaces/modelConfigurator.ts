import { MetadataSourceType } from './metadata';
import { IEntityTypeIndentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { IReferenceListIdentifier } from './referenceList';

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
  entityType?: IEntityTypeIndentifier | null;
  /**
   * Reference list Id
   */
  referenceListId?: IReferenceListIdentifier | null;

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
