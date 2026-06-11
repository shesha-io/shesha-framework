import { MetadataSourceType } from './metadata';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { IReferenceListIdentifier } from './referenceList';
import { EntityInitFlags } from '@/apis/modelConfigurations';

export interface IModelItem {
  id: string;
  /**
   * Property Name
   */
  name?: string | null | undefined;
  /**
   * Label (display name)
   */
  label?: string | null | undefined;
  /**
   * Description
   */
  description?: string | null | undefined;
  /**
   * Data type
   */
  dataType: string;
  /**
   * Data format
   */
  dataFormat?: string | null | undefined;
  /**
   * Entity type. Aplicable for entity references
   */
  entityType?: IEntityTypeIdentifier | null | undefined;
  /**
   * Reference list Id
   */
  referenceListId?: IReferenceListIdentifier | null | undefined;

  source?: MetadataSourceType | undefined;

  suppress?: boolean | undefined;

  properties?: IModelItem[] | undefined;

  itemsType?: IModelItem | undefined;

  isItemsType?: boolean | undefined;

  isChildProperty?: boolean | undefined;

  /**
   * If true, indicates that current property is a framework-related (e.g. Abp.Domain.Entities.ISoftDelete.IsDeleted, Abp.Domain.Entities.Auditing.IHasModificationTime.LastModificationTime)
   */
  isFrameworkRelated?: boolean | undefined;

  columnName?: string | undefined;
  createdInDb?: boolean | undefined;
  inheritedFromId?: string | undefined;

  initStatus?: EntityInitFlags | undefined;
  initMessage?: string | undefined;
}
