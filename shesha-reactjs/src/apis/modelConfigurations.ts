import { IReferenceListIdentifier } from '@/interfaces';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

type RefListPermissionedAccess = 1 | 2 | 3 | 4 | 5;

/**
 * Indicate the source of the entity/property metadata
 */
export type MetadataSourceType = 1 | 2;
export const MetadataSourceTypeUseDefined = 2 as MetadataSourceType;

interface PermissionedObjectDto {
  id?: string;
  object?: string | null;
  category?: string | null;
  module?: string | null;
  moduleName?: string | null;
  type?: string | null;
  name?: string | null;
  description?: string | null;
  permissions?: string[] | null;
  actualPermissions?: string[] | null;
  access?: RefListPermissionedAccess;
  inherited?: boolean;
  actualAccess?: RefListPermissionedAccess;
  parent?: string | null;
  dependency?: string | null;
  child?: PermissionedObjectDto[] | null;
  hidden?: boolean;
  additionalParameters?: {
    [key: string]: string | null;
  } | null;
}

interface IHasDefaultEditor {
  defaultEditor?: string | null;
}

interface IHasFilter {
  filter: object;
}

interface INumberFormatting {
  thousandsSeparator?: string;
  customFormat?: string | null;
}

interface IAdditionalInfoFormatting {
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  suffixIcon?: string;
  prefixIcon?: string;
}

interface IDecimalFormatting extends INumberFormatting {
  numDecimalPlaces?: number | null;
  showAsPercentage?: boolean;
}

interface IEntityPropertyListDbMapping
{
    manyToManyTableName?: string | null;
    manyToManyKeyColumnName?: string | null;
    manyToManyChildColumnName?: string | null;
    manyToManyInversePropertyName?: string | null;
}

type EntityPropertyListMappingType = "many-to-many" | "many-to-one";

export enum EntityInitFlags {
  None = 0,
  DbActionRequired = 1,
  InitializationRequired = 2,

  DbActionFailed = 32,
  InitializationFailed = 64,
}

interface IEntityPropertyListConfiguration{
  mappingType?: EntityPropertyListMappingType;
  foreignProperty?: string | null;
  dbMapping?: IEntityPropertyListDbMapping;
}

/**
 * Model property DTO
 */
export interface ModelPropertyDto {

  initStatus?: EntityInitFlags;
  initMessage: string | null;

  columnName?: string | null;
  createdInDb?: boolean;
  inheritedFromId?: string | null;

  id?: string | null;
  /**
   * Property Name
   */
  name: string;
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
  entityType?: IEntityTypeIdentifier | null;
  /**
   * Reference list
   */

  referenceListId?: IReferenceListIdentifier | null;
  /**
   * Metadata Source Type
   */
  source?: MetadataSourceType;
  /**
   * Default sort order
   */
  sortOrder?: number | null;
  /**
   * Child properties, applicable for complex data types (e.g. object, array)
   */
  properties?: ModelPropertyDto[] | null;
  /**
   * If true, indicates that current property is a framework-related (e.g. !:ISoftDelete.IsDeleted, !:IHasModificationTime.LastModificationTime)
   */
  isFrameworkRelated?: boolean;
  /**
   * If true, the property is not returned from Get end-points and is ignored if submitted on Create/Update end-points
   * The property should also not be listed on the form configurator property list
   */
  suppress?: boolean;
  /**
   * Indicates if a property value is required in order to save
   */
  required?: boolean;
  /**
   * If true, the property cannot be edited via the dynamically generated create/update end-points:
   * - property should not be listed on create/update end-points
   * - should be set to 'True' and not editable for read-only properties of domain classes
   */
  readOnly?: boolean;
  /**
   * Equivalent to Audited attribute on the property
   */
  audited?: boolean;
  /**
   * Validation min
   */
  min?: number | null;
  /**
   * Validation max
   */
  max?: number | null;
  /**
   * Validation min length
   */
  minLength?: number | null;
  /**
   * Validation max length
   */
  maxLength?: number | null;
  /**
   * Validation RegularExpression
   */
  regExp?: string | null;
  /**
   * Validation message
   */
  validationMessage?: string | null;
  /**
   * Allows to create child/nested entity
   */
  cascadeCreate?: boolean;
  /**
   * Allows to update child/nested entity
   */
  cascadeUpdate?: boolean;
  /**
   * Delete child/nested entity if reference was removed and the child/nested entity doesn't have nother references
   */
  cascadeDeleteUnreferenced?: boolean;
  suppressHardcoded?: boolean;
  requiredHardcoded?: boolean;
  readOnlyHardcoded?: boolean;
  auditedHardcoded?: boolean;
  sizeHardcoded?: boolean;
  regExpHardcoded?: boolean;
  /**
   * Allows to create child/nested entity
   */
  cascadeCreateHardcoded?: boolean;
  /**
   * Allows to update child/nested entity
   */
  cascadeUpdateHardcoded?: boolean;
  /**
   * Delete child/nested entity if reference was removed and the child/nested entity doesn't have nother references
   */
  cascadeDeleteUnreferencedHardcoded?: boolean;

  formatting?: IHasDefaultEditor & IAdditionalInfoFormatting & (IHasFilter | IDecimalFormatting);

  listConfiguration?: IEntityPropertyListConfiguration;

  itemsType?: ModelPropertyDto | null;

  isItemsType?: boolean;

  /** Used only for Model Configurator */
  genericEntityReference?: boolean;

  /** Used only for Model Configurator */
  allowEdit?: boolean;
}

/**
 * Indicate the type of the entity metadata
 */
type EntityConfigTypes = 1 | 2;

interface FormIdFullNameDto {
  name?: string | null;
  module?: string | null;
}

export interface EntityViewConfigurationDto {
  isStandard?: boolean;
  type?: string | null;
  formId?: FormIdFullNameDto | undefined;
}

/**
 * Model configuration DTO
 */
export interface ModelConfigurationDto {
  id: string;
  className?: string | null | undefined;
  namespace?: string | null | undefined;
  generateAppService?: boolean;
  allowConfigureAppService?: boolean;
  properties: ModelPropertyDto[];
  moduleId?: string | null | undefined;
  module?: string | null | undefined;
  name?: string | null;
  label?: string | null;
  description?: string | null;
  versionNo?: number;
  suppress?: boolean;
  notImplemented?: boolean;
  source?: MetadataSourceType;
  entityConfigType?: EntityConfigTypes;
  permission?: PermissionedObjectDto;
  permissionGet?: PermissionedObjectDto;
  permissionCreate?: PermissionedObjectDto;
  permissionUpdate?: PermissionedObjectDto;
  permissionDelete?: PermissionedObjectDto;
  viewConfigurations?: EntityViewConfigurationDto[] | null;

  initStatus: EntityInitFlags | null;
  initMessage?: string;
}
