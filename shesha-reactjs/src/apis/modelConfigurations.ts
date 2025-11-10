import { IAjaxResponse, IAjaxResponseBase } from '@/interfaces/ajaxResponse';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import * as RestfulShesha from '@/utils/fetchers';

export type RefListPermissionedAccess = 1 | 2 | 3 | 4 | 5;

/**
 * Indicate the source of the entity/property metadata
 */
export type MetadataSourceType = 1 | 2;
export const MetadataSourceTypeApplication = 1 as MetadataSourceType;
export const MetadataSourceTypeUseDefined = 2 as MetadataSourceType;

export interface PermissionedObjectDto {
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

export interface INumberFormatting {
  showThousandsSeparator?: boolean;
  customFormat?: string | null;
}

export interface IIntegerFormatting extends INumberFormatting {
}

export interface IDecimalFormatting extends INumberFormatting {
  numDecimalPlaces?: number | null;
  showAsPercentage?: boolean;
}

export interface IFloatFormatting extends INumberFormatting {
}

export interface IEntityPropertyListDbMapping
{
    manyToManyTableName?: string | null;
    manyToManyKeyColumnName?: string | null;
    manyToManyChildColumnName?: string | null;
    manyToManyInversePropertyName?: string | null;
}

export type EntityPropertyListMappingType = "many-to-many" | "many-to-one";

export interface IEntityPropertyListConfiguration{
  mappingType?: EntityPropertyListMappingType;
  foreignProperty?: string | null;
  dbMapping?: IEntityPropertyListDbMapping;
}

/**
 * Model property DTO
 */
export interface ModelPropertyDto {

  columnName?: string | null;
  createdInDb?: boolean;
  inheritedFromId?: string | null;

  listConfiguration?: IEntityPropertyListConfiguration;

  id?: string | null;
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
  entityType?: IEntityTypeIdentifier | null;
  /**
   * Reference list name
   */
  referenceListName?: string | null;
  /**
   * Reference list module
   */
  referenceListModule?: string | null;
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

  formatting?: INumberFormatting | IIntegerFormatting | IDecimalFormatting | IFloatFormatting;
}

/**
 * Status of the Shesha.Domain.ConfigurationItem
 */
export type ConfigurationItemVersionStatus = 1 | 2 | 3 | 4 | 5;

/**
 * Indicate the type of the entity metadata
 */
export type EntityConfigTypes = 1 | 2;

export interface FormIdFullNameDto {
  name?: string | null;
  module?: string | null;
}

export interface EntityViewConfigurationDto {
  isStandard?: boolean;
  type?: string | null;
  formId?: FormIdFullNameDto;
}

/**
 * Model configuration DTO
 */
export interface ModelConfigurationDto {
  id?: string | null;
  className?: string | null;
  namespace?: string | null;
  generateAppService?: boolean;
  allowConfigureAppService?: boolean;
  properties?: ModelPropertyDto[] | null;
  moduleId?: string | null;
  module?: string | null;
  name?: string | null;
  label?: string | null;
  description?: string | null;
  versionNo?: number;
  versionStatus?: ConfigurationItemVersionStatus;
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
}

interface EmptyQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}
export interface ModelConfigurationsGetByIdPathParams {
  id: string;
}

type ModelConfigurationDtoAjaxResponse = IAjaxResponse<ModelConfigurationDto>;

export type modelConfigurationsGetByIdProps = Omit<
  RestfulShesha.GetProps<
    ModelConfigurationDtoAjaxResponse,
    IAjaxResponseBase,
    EmptyQueryParams,
    ModelConfigurationsGetByIdPathParams
  > & { id: string },
  'queryParams'
>;
export const modelConfigurationsGetById = (
  queryParams: EmptyQueryParams,
  { id, ...props }: modelConfigurationsGetByIdProps
) =>
  RestfulShesha.get<
    ModelConfigurationDtoAjaxResponse,
    IAjaxResponseBase,
    EmptyQueryParams,
    ModelConfigurationsGetByIdPathParams
  >(`/api/ModelConfigurations/${id}`, queryParams, props);

export type modelConfigurationsUpdateProps = Omit<
  RestfulShesha.MutateProps<
    ModelConfigurationDtoAjaxResponse,
    IAjaxResponseBase,
    EmptyQueryParams,
    ModelConfigurationDto,
    void
  >,
  'data'
>;
export const modelConfigurationsUpdate = (data: ModelConfigurationDto, props: modelConfigurationsUpdateProps) =>
  RestfulShesha.mutate<
    ModelConfigurationDtoAjaxResponse,
    IAjaxResponseBase,
    EmptyQueryParams,
    ModelConfigurationDto,
    void
  >('PUT', `/api/ModelConfigurations`, data, props);

export type modelConfigurationsCreateProps = Omit<
  RestfulShesha.MutateProps<
    ModelConfigurationDtoAjaxResponse,
    IAjaxResponseBase,
    EmptyQueryParams,
    ModelConfigurationDto,
    void
  >,
  'data'
>;
export const modelConfigurationsCreate = (data: ModelConfigurationDto, props: modelConfigurationsCreateProps) =>
  RestfulShesha.mutate<
    ModelConfigurationDtoAjaxResponse,
    IAjaxResponseBase,
    EmptyQueryParams,
    ModelConfigurationDto,
    void
  >('POST', `/api/ModelConfigurations`, data, props);

export interface EntityConfigDeleteQueryParams {
  id?: string;
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type entityConfigDeleteProps = Omit<
  RestfulShesha.MutateProps<void, unknown, EntityConfigDeleteQueryParams, void, void>,
  'data'
>;
export const entityConfigDelete = (props: entityConfigDeleteProps) =>
  RestfulShesha.mutate<void, unknown, EntityConfigDeleteQueryParams, void, void>(
    'DELETE',
    `/api/services/app/EntityConfig/Delete`,
    undefined,
    props
  );

export interface MergeConfigurationDto {
  sourceId?: string | null;
  destinationId?: string | null;
  deleteAfterMerge?: boolean;
}

export interface ModelConfigurationsMergeQueryParams {
  /**
   * The requested API version
   */
  'api-version'?: string;
}

export type modelConfigurationsMergeProps = Omit<
  RestfulShesha.MutateProps<
    ModelConfigurationDtoAjaxResponse,
    IAjaxResponseBase,
    ModelConfigurationsMergeQueryParams,
    MergeConfigurationDto,
    void
  >,
  'data'
>;
export const modelConfigurationsMerge = (data: MergeConfigurationDto, props: modelConfigurationsMergeProps) =>
  RestfulShesha.mutate<
    ModelConfigurationDtoAjaxResponse,
    IAjaxResponseBase,
    ModelConfigurationsMergeQueryParams,
    MergeConfigurationDto,
    void
  >('POST', `/api/ModelConfigurations/merge`, data, props);
