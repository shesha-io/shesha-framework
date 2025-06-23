using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Services;
using Abp.Reflection;
using Abp.Runtime.Caching;
using AutoMapper;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Shesha.Configuration.MappingMetadata;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Cache;
using Shesha.DynamicEntities.Dtos;
using Shesha.DynamicEntities.Exceptions;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.Metadata;
using Shesha.Metadata.Dtos;
using Shesha.Permissions;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    /// inheritedDoc
    public class ModelConfigurationManager : DomainService, IModelConfigurationManager, ITransientDependency
    {
        private readonly IRepository<EntityConfig, Guid> _entityConfigRepository;
        private readonly IRepository<ConfigurationItem, Guid> _configurationItemRepository;
        private readonly IRepository<EntityProperty, Guid> _entityPropertyRepository;
        private readonly IPermissionedObjectManager _permissionedObjectManager;
        private readonly ITypeFinder _typeFinder;
        private readonly IHardcodeMetadataProvider _metadataProvider;
        private readonly IMappingMetadataProvider _mappingMetadataProvider;
        private readonly IRepository<Domain.Module, Guid> _moduleRepository;
        private readonly ITypedCache<string, ModelConfigurationDto?> _modelConfigsCache;
        private readonly IModelConfigsCacheHolder _modelConfigsCacheHolder;
        

        public ModelConfigurationManager(
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IRepository<EntityProperty, Guid> entityPropertyRepository,
            IPermissionedObjectManager permissionedObjectManager,
            ITypeFinder typeFinder,
            IHardcodeMetadataProvider metadataProvider,
            IRepository<ConfigurationItem, Guid> configurationItemRepository,
            IMappingMetadataProvider mappingMetadataProvider,
            IRepository<Domain.Module, Guid> moduleRepository,
            IModelConfigsCacheHolder modelConfigsCacheHolder
            )
        {
            _entityConfigRepository = entityConfigRepository;
            _entityPropertyRepository = entityPropertyRepository;
            _permissionedObjectManager = permissionedObjectManager;
            _typeFinder = typeFinder;
            _metadataProvider = metadataProvider;
            _configurationItemRepository = configurationItemRepository;
            _mappingMetadataProvider = mappingMetadataProvider;
            _moduleRepository = moduleRepository;
            _modelConfigsCacheHolder = modelConfigsCacheHolder;
            _modelConfigsCache = modelConfigsCacheHolder.Cache;
        }

        public async Task MergeConfigurationsAsync(EntityConfig source, EntityConfig destination, bool deleteAfterMerge, bool deepUpdate)
        {
            // Copy main data
            var revision = destination.EnsureLatestRevision();
            revision.Label = source.Revision.Label;
            revision.GenerateAppService = source.Revision.GenerateAppService;

            // Copy View configs
            CopyViewConfigs(source, destination);

            // Copy properties
            await CopyPropertiesAsync(source, destination);

            // Copy permissions
            await CopyPermissionsAsync(source, destination);

            // update ClassName references
            if (deepUpdate)
                await DeepUpdateAsync(source, destination);

            if (deleteAfterMerge)
            {
                // TODO: V1 review should we delete entire configuration of only revision? or maybe close the revision
                await _entityPropertyRepository.DeleteAsync(x => x.EntityConfigRevision.ConfigurationItem.Id == source.Id);
                await _configurationItemRepository.DeleteAsync(source.Id);
            }

            var key = _modelConfigsCacheHolder.GetCacheKey(destination.LatestRevision.Namespace, destination.LatestRevision.ClassName);
            await _modelConfigsCache.RemoveAsync(key);
        }

        private void CopyViewConfigs(EntityConfig source, EntityConfig destination)
        {
            var srcViewConfigs = source.Revision?.ViewConfigurations;

            // update only empty ViewConfigurations
            if (srcViewConfigs != null)
            {
                var revision = destination.EnsureLatestRevision();
                var dstViewConfigs = revision.ViewConfigurations ??= new List<EntityViewConfigurationDto>();

                foreach (var configuration in srcViewConfigs)
                {
                    var vconfig = dstViewConfigs.FirstOrDefault(x => x.Type == configuration.Type);
                    if (vconfig == null)
                    {
                        dstViewConfigs.Add(
                            new EntityViewConfigurationDto()
                            {
                                Type = configuration.Type,
                                FormId = configuration.FormId,
                                IsStandard = configuration.IsStandard,
                            });
                    }
                    else if (vconfig.FormId == null)
                    {
                        vconfig.FormId = configuration.FormId;
                    }
                }
            }
        }

        private async Task CopyPropertiesAsync(EntityConfig destination, List<EntityProperty>? destPs, List<EntityProperty> sourcePs, EntityProperty? parent)
        {
            var dstRevision = destination.EnsureLatestRevision();

            foreach (var prop in sourcePs)
            {
                var destProp = destPs?.FirstOrDefault(x => x.Name == prop.Name);
                if (destProp == null && prop.Source == MetadataSourceType.UserDefined)
                {
                    destProp = new EntityProperty()
                    {
                        EntityConfigRevision = dstRevision,

                        Name = prop.Name,
                        DataType = prop.DataType,
                        DataFormat = prop.DataFormat,
                        EntityType = prop.EntityType,
                        IsFrameworkRelated = prop.IsFrameworkRelated,
                        ItemsType = prop.ItemsType,
                        ReferenceListName = prop.ReferenceListName,
                        ReferenceListModule = prop.ReferenceListModule,
                        Source = dstRevision.Source == MetadataSourceType.ApplicationCode 
                            ? prop.Source 
                            : MetadataSourceType.UserDefined,
                        Suppress = prop.Suppress,
                        ParentProperty = parent
                    };
                }

                if (destProp != null)
                {
                    destProp.Audited = prop.Audited;
                    destProp.Description = prop.Description;
                    destProp.Label = prop.Label;
                    destProp.Max = prop.Max;
                    destProp.Min = prop.Min;
                    destProp.Required = prop.Required;
                    destProp.MaxLength = prop.MaxLength;
                    destProp.MinLength = prop.MinLength;
                    destProp.ReadOnly = prop.ReadOnly;
                    destProp.RegExp = prop.RegExp;
                    destProp.CascadeCreate = destProp.CascadeCreate || prop.CascadeCreate;
                    destProp.CascadeUpdate = destProp.CascadeUpdate || prop.CascadeUpdate;
                    destProp.CascadeDeleteUnreferenced = destProp.CascadeDeleteUnreferenced || prop.CascadeDeleteUnreferenced;

                    await _entityPropertyRepository.InsertOrUpdateAsync(destProp);

                    if (prop.Properties?.Any() ?? false)
                        await CopyPropertiesAsync(destination, destProp.Properties?.ToList(), prop.Properties.ToList(), destProp);
                }
            }
        }

        private async Task CopyPropertiesAsync(EntityConfig source, EntityConfig destination)
        {
            var srcRevision = source.LatestRevision;
            var dstRevision = destination.EnsureLatestRevision();
            
            var destProps = await _entityPropertyRepository.GetAll().Where(x => x.EntityConfigRevision.Id == dstRevision.Id).ToListAsync();
            var sourceProps = await _entityPropertyRepository.GetAll().Where(x => x.EntityConfigRevision.Id == srcRevision.Id).ToListAsync();

            await CopyPropertiesAsync(destination, destProps, sourceProps, null);
        }

        private async Task CopyPermissionsAsync(EntityConfig source, EntityConfig destination)
        {
            var copyPermission = async (string method, string type) =>
            {
                var sourcePermission = await _permissionedObjectManager.GetOrDefaultAsync($"{source.Revision.FullClassName}{method}", type);
                var destinationPermission = await _permissionedObjectManager.GetOrDefaultAsync($"{destination.Revision.FullClassName}{method}", type);
                destinationPermission.Access = sourcePermission.Access;
                destinationPermission.Type = type;
                if (sourcePermission.Permissions != null) 
                {
                    destinationPermission.Permissions ??= new();

                    sourcePermission.Permissions.ToList().ForEach(x =>
                    {
                        if (!destinationPermission.Permissions.Contains(x))
                            destinationPermission.Permissions.Add(x);
                    });
                }                
                await _permissionedObjectManager.SetAsync(destinationPermission);
            };

            await copyPermission("", ShaPermissionedObjectsTypes.Entity);
            await copyPermission("@Get", ShaPermissionedObjectsTypes.EntityAction);
            await copyPermission("@Create", ShaPermissionedObjectsTypes.EntityAction);
            await copyPermission("@Update", ShaPermissionedObjectsTypes.EntityAction);
            await copyPermission("@Delete", ShaPermissionedObjectsTypes.EntityAction);
        }

        private async Task DeepUpdateAsync(EntityConfig source, EntityConfig destination)
        {
            var srcClassName = source.Revision.FullClassName;
            var dstClassName = destination.Revision.FullClassName;

            // update Properties
            var toUpdate = _entityPropertyRepository.GetAll().Where(x => x.EntityType == srcClassName);
            foreach (var entity in toUpdate)
            {
                entity.EntityType = dstClassName;
                await _entityPropertyRepository.UpdateAsync(entity);
            }

            // update JsonEntity and GenericEntityReference properties

            var entityTypes = _typeFinder.FindAll().Where(t => t.IsEntityType()).ToList();
            foreach (var entityType in entityTypes)
            {
                var jsonProps = entityType.GetProperties().Where(x => x.PropertyType.IsJsonEntityType()).ToList();
                var genericProps = entityType.GetProperties().Where(x => x.PropertyType == typeof(GenericEntityReference)).ToList();

                if (jsonProps.Any())
                    try
                    {
                        await _mappingMetadataProvider.UpdateClassNamesAsync(entityType, jsonProps, srcClassName, dstClassName, true);
                    }
                    catch { /* hide exception for entities without tables */ }

                if (genericProps.Any())
                    try
                    {
                        await _mappingMetadataProvider.UpdateClassNamesAsync(entityType, genericProps, srcClassName, dstClassName, false);
                    }
                    catch { /* hide exception for entities without tables */ }
            }
        }

        public Task<ModelConfigurationDto> CreateAsync(ModelConfigurationDto input)
        {
            var modelConfig = new EntityConfig();

            input.Namespace = "Dynamic";
            input.ClassName = input.Name;

            // todo: add validation

            return CreateOrUpdateAsync(modelConfig, input, true);
        }

        public async Task<ModelConfigurationDto> UpdateAsync(ModelConfigurationDto input)
        {
            var modelConfig = await _entityConfigRepository.GetAll().Where(m => m.Id == input.Id).FirstOrDefaultAsync();
            if (modelConfig == null)
                throw new ModelConfigurationNotFoundException(input.Namespace, input.Name);

            if (modelConfig.LatestRevision.Source == MetadataSourceType.UserDefined)
            {
                input.Namespace = "Dynamic";
                input.ClassName = input.Name;
            }

            // todo: add validation

            var res = await CreateOrUpdateAsync(modelConfig, input, false);
            
            var key = _modelConfigsCacheHolder.GetCacheKey(res.Namespace, res.ClassName);
            await _modelConfigsCache.RemoveAsync(key);

            return res;
        }

        private async Task<ModelConfigurationDto> CreateOrUpdateAsync(EntityConfig modelConfig, ModelConfigurationDto input, bool create)
        {
            var mapper = GetModelConfigMapper(modelConfig.Revision.Source ?? MetadataSourceType.UserDefined);
            mapper.Map(input, modelConfig);

            var module = input.ModuleId.HasValue
                ? await _moduleRepository.GetAsync(input.ModuleId.Value)
                : null;

            modelConfig.Module = module;

            modelConfig.Normalize();

            if (create)
            {
                await _entityConfigRepository.InsertAsync(modelConfig);
            }
            else
            {
                await _entityConfigRepository.UpdateAsync(modelConfig);
            }

            var revision = modelConfig.EnsureLatestRevision();
            var properties = await _entityPropertyRepository.GetAll().Where(p => p.EntityConfigRevision == revision).OrderBy(p => p.SortOrder).ToListAsync();

            var mappers = new Dictionary<MetadataSourceType, IMapper> {
                { MetadataSourceType.ApplicationCode, GetPropertyMapper(MetadataSourceType.ApplicationCode) },
                { MetadataSourceType.UserDefined, GetPropertyMapper(MetadataSourceType.UserDefined) }
            };

            await BindPropertiesAsync(mappers, properties, input.Properties, modelConfig, null);

            // delete missing properties
            var allPropertiesId = new List<Guid>();
            ActionPropertiesRecursive(input.Properties, prop =>
            {
                var id = prop.Id.ToGuidOrNull();
                if (id != null)
                    allPropertiesId.Add(id.Value);
            });
            var toDelete = properties.Where(p => !p.Name.IsSpecialProperty() && !allPropertiesId.Contains(p.Id)).ToList();
            foreach (var prop in toDelete)
            {

                await _entityPropertyRepository.DeleteAsync(prop);
            }

            if (input.Permission != null)
            {
                input.Permission.Type = ShaPermissionedObjectsTypes.Entity;
                await _permissionedObjectManager.SetAsync(input.Permission);
            }
            if (input.PermissionGet != null)
            {
                input.PermissionGet.Type = ShaPermissionedObjectsTypes.EntityAction;
                await _permissionedObjectManager.SetAsync(input.PermissionGet);
            }
            if (input.PermissionCreate != null)
            {
                input.PermissionCreate.Type = ShaPermissionedObjectsTypes.EntityAction;
                await _permissionedObjectManager.SetAsync(input.PermissionCreate);
            }
            if (input.PermissionUpdate != null)
            {
                input.PermissionUpdate.Type = ShaPermissionedObjectsTypes.EntityAction;
                await _permissionedObjectManager.SetAsync(input.PermissionUpdate);
            }
            if (input.PermissionDelete != null)
            {
                input.PermissionDelete.Type = ShaPermissionedObjectsTypes.EntityAction;
                await _permissionedObjectManager.SetAsync(input.PermissionDelete);
            }

            var dto = await GetModelConfigurationAsync(modelConfig);
            // update permissions from the input because data is not saved to DB yet
            if (input.Permission != null)
            {
                dto.Permission = input.Permission;
                dto.Permission.ActualAccess = input.Permission.Access;
                dto.Permission.ActualPermissions = input.Permission.Permissions;
            }
            else
                dto.Permission = null;

            if (input.PermissionGet != null)
            {
                dto.PermissionGet = input.PermissionGet;
                dto.PermissionGet.ActualAccess = input.PermissionGet.Access;
                dto.PermissionGet.ActualPermissions = input.PermissionGet.Permissions;
            }
            else
                dto.PermissionGet = null;

            if (input.PermissionUpdate != null)
            {
                dto.PermissionUpdate = input.PermissionUpdate;
                dto.PermissionUpdate.ActualAccess = input.PermissionUpdate.Access;
                dto.PermissionUpdate.ActualPermissions = input.PermissionUpdate.Permissions;
            }
            else
                dto.PermissionUpdate = null;

            if (input.PermissionDelete != null)
            {
                dto.PermissionDelete = input.PermissionDelete;
                dto.PermissionDelete.ActualAccess = input.PermissionDelete.Access;
                dto.PermissionDelete.ActualPermissions = input.PermissionDelete.Permissions;
            }
            else
                dto.PermissionDelete = null;

            if (input.PermissionCreate != null)
            {
                dto.PermissionCreate = input.PermissionCreate;
                dto.PermissionCreate.ActualAccess = input.PermissionCreate.Access;
                dto.PermissionCreate.ActualPermissions = input.PermissionCreate.Permissions;
            }
            else
                dto.PermissionCreate = null;

            return dto;
        }

        private IMapper GetModelConfigMapper(MetadataSourceType sourceType)
        {
            var modelConfigMapperConfig = new MapperConfiguration(cfg =>
            {
                // Fix bug of Automapper < 11.0.0 under .net 7 https://stackoverflow.com/questions/74730425/system-datetime-on-t-maxintegertsystem-collections-generic-ienumerable1t
                cfg.ShouldMapMethod = (m) => { return false; };

                var mapExpression = cfg.CreateMap<ModelConfigurationDto, EntityConfig>()
                    .ForMember(d => d.Id, o => o.Ignore());

                if (sourceType == MetadataSourceType.ApplicationCode)
                {
                    // TODO: V1 review
                    /*
                    mapExpression.ForMember(d => d.ClassName, o => o.Ignore());
                    mapExpression.ForMember(d => d.Namespace, o => o.Ignore());
                    */
                    mapExpression.ForMember(e => e.Module, c => c.Ignore());
                }
            });

            return modelConfigMapperConfig.CreateMapper();
        }

        private void ActionPropertiesRecursive(List<ModelPropertyDto> properties, Action<ModelPropertyDto> action)
        {
            if (properties == null) return;
            foreach (var property in properties)
            {
                action.Invoke(property);
                if (property.Properties != null)
                    ActionPropertiesRecursive(property.Properties, action);
            }
        }

        private async Task BindPropertiesAsync(Dictionary<MetadataSourceType, IMapper> mappers, List<EntityProperty> allProperties, List<ModelPropertyDto> inputProperties, EntityConfig modelConfig, EntityProperty? parentProperty)
        {
            if (inputProperties == null) return;
            var sortOrder = 0;
            foreach (var inputProp in inputProperties)
            {
                var propId = inputProp.Id.ToGuid();
                var dbProp = propId != Guid.Empty
                    ? allProperties.FirstOrDefault(p => p.Id == propId)
                    : null;
                var isNew = dbProp == null;
                if (dbProp == null)
                    dbProp = new EntityProperty
                    {
                        EntityConfigRevision = modelConfig.EnsureLatestRevision(),
                    };
                dbProp.ParentProperty = parentProperty;

                var propertyMapper = mappers[dbProp.Source ?? MetadataSourceType.UserDefined];
                propertyMapper.Map(inputProp, dbProp);

                // bind child properties
                if (inputProp.Properties != null && inputProp.Properties.Any())
                    await BindPropertiesAsync(mappers, allProperties, inputProp.Properties, modelConfig, dbProp);

                dbProp.SortOrder = sortOrder++;

                await _entityPropertyRepository.InsertOrUpdateAsync(dbProp);
            }
        }

        private IMapper GetPropertyMapper(MetadataSourceType sourceType)
        {
            var propertyMapperConfig = new MapperConfiguration(cfg =>
            {
                // Fix bug of Automapper < 11.0.0 under .net 7 https://stackoverflow.com/questions/74730425/system-datetime-on-t-maxintegertsystem-collections-generic-ienumerable1t
                cfg.ShouldMapMethod = (m) => { return false; };

                var mapExpression = cfg.CreateMap<ModelPropertyDto, EntityProperty>()
                    .ForMember(d => d.Id, o => o.Ignore())
                    .ForMember(d => d.EntityConfigRevision, o => o.Ignore())
                    .ForMember(d => d.SortOrder, o => o.Ignore())
                    .ForMember(d => d.Properties, o => o.Ignore())
                    .ForMember(d => d.Source, o => o.Ignore());

                if (sourceType == MetadataSourceType.ApplicationCode)
                {
                    mapExpression.ForMember(d => d.Name, o => o.Ignore());
                    mapExpression.ForMember(d => d.DataType, o => o.Ignore());
                    mapExpression.ForMember(d => d.EntityType, o => o.Ignore());
                }
            });

            return propertyMapperConfig.CreateMapper();
        }

        public async Task<ModelConfigurationDto> GetModelConfigurationAsync(EntityConfig modelConfig, List<PropertyMetadataDto>? hardCodedProps = null)
        {
            try
            {
                var dto1 = ObjectMapper.Map<ModelConfigurationDto>(modelConfig);
            }
            catch
            { 
            }
            
            var dto = ObjectMapper.Map<ModelConfigurationDto>(modelConfig);

            var revision = modelConfig.Revision;

            var properties = await _entityPropertyRepository.GetAll()
                .Where(p => p.EntityConfigRevision == revision && p.ParentProperty == null)
                .OrderBy(p => p.SortOrder).ToListAsync();

            dto.Properties = properties.Select(p => ObjectMapper.Map<ModelPropertyDto>(p)).OrderBy(x => x.SortOrder).ToList();

            var containerType = _typeFinder.Find(x => x.Namespace == revision.Namespace && x.Name == revision.ClassName).FirstOrDefault();

            if (containerType != null)
            {
                var metadataContext = new MetadataContext(containerType);
                hardCodedProps ??= containerType.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                    .Select(p => _metadataProvider.GetPropertyMetadata(p, metadataContext))
                    .OrderBy(e => e.Path)
                    .ToList();

                foreach (var prop in dto.Properties)
                {
                    var hardCodedProp = hardCodedProps.FirstOrDefault(pp => pp.Path == prop.Name);
                    if (hardCodedProp != null)
                    {
                        prop.Suppress = !hardCodedProp.IsVisible || (prop.Suppress ?? false);
                        prop.Required = hardCodedProp.Required || (prop.Required ?? false);
                        prop.ReadOnly = hardCodedProp.Readonly || (prop.ReadOnly ?? false);
                        prop.Audited = hardCodedProp.Audited || (prop.Audited ?? false);
                        prop.MinLength = hardCodedProp.MinLength ?? prop.MinLength;
                        prop.MaxLength = hardCodedProp.MaxLength ?? prop.MaxLength;
                        prop.Min = hardCodedProp.Min ?? prop.Min;
                        prop.Max = hardCodedProp.Max ?? prop.Max;
                        prop.RegExp = string.IsNullOrWhiteSpace(hardCodedProp.RegExp) ? prop.RegExp : hardCodedProp.RegExp;
                        prop.ValidationMessage = string.IsNullOrWhiteSpace(hardCodedProp.ValidationMessage)
                            ? prop.ValidationMessage
                            : hardCodedProp.ValidationMessage;

                        prop.SuppressHardcoded = !hardCodedProp.IsVisible;
                        prop.RequiredHardcoded = hardCodedProp.Required;
                        prop.ReadOnlyHardcoded = hardCodedProp.Readonly;
                        prop.AuditedHardcoded = hardCodedProp.Audited;
                        prop.SizeHardcoded = hardCodedProp.Min.HasValue
                            || hardCodedProp.Max.HasValue
                            || hardCodedProp.MinLength.HasValue
                            || hardCodedProp.MaxLength.HasValue;
                        prop.RegExpHardcoded = !string.IsNullOrWhiteSpace(hardCodedProp.RegExp);

                        prop.CascadeCreateHardcoded = hardCodedProp.CascadeCreate != null;
                        prop.CascadeUpdateHardcoded = hardCodedProp.CascadeUpdate != null;
                        prop.CascadeDeleteUnreferencedHardcoded = hardCodedProp.CascadeDeleteUnreferenced != null;

                        prop.EntityModule = hardCodedProp.EntityModule;
                        prop.ModuleAccessor = hardCodedProp.ModuleAccessor;
                        prop.TypeAccessor = hardCodedProp.TypeAccessor;
                    }
                }
            }

            dto.HardcodedPropertiesMD5 = modelConfig.Revision?.HardcodedPropertiesMD5;
            
            var changeDates = properties.Select(p => p.LastModificationTime ?? p.CreationTime).ToList();
            changeDates.Add(modelConfig.LastModificationTime ?? modelConfig.CreationTime);
            dto.ChangeTime = changeDates.Max();

            var fullClassName = revision.FullClassName;

            dto.Permission = await _permissionedObjectManager.GetOrDefaultAsync($"{fullClassName}", ShaPermissionedObjectsTypes.Entity);
            dto.PermissionGet = await _permissionedObjectManager.GetOrDefaultAsync($"{fullClassName}@Get", ShaPermissionedObjectsTypes.EntityAction);
            dto.PermissionCreate = await _permissionedObjectManager.GetOrDefaultAsync($"{fullClassName}@Create", ShaPermissionedObjectsTypes.EntityAction);
            dto.PermissionUpdate = await _permissionedObjectManager.GetOrDefaultAsync($"{fullClassName}@Update", ShaPermissionedObjectsTypes.EntityAction);
            dto.PermissionDelete = await _permissionedObjectManager.GetOrDefaultAsync($"{fullClassName}@Delete", ShaPermissionedObjectsTypes.EntityAction);

            dto.NormalizeViewConfigurations(modelConfig);

            return dto;
        }

        public async Task<ModelConfigurationDto?> GetModelConfigurationOrNullAsync(string? @namespace, string name, List<PropertyMetadataDto>? hardCodedProps = null)
        {
            var cacheKey = _modelConfigsCacheHolder.GetCacheKey(@namespace, name);

            var result = await _modelConfigsCache.GetAsync(cacheKey, async () => {
                using (var uow = UnitOfWorkManager.Begin(System.Transactions.TransactionScopeOption.RequiresNew)) 
                {
                    var modelConfig = await _entityConfigRepository.GetAll().Where(m => m.LatestRevision.ClassName == name && m.LatestRevision.Namespace == @namespace && !m.IsDeleted).FirstOrDefaultAsync();
                    if (modelConfig == null)
                        return null;

                    var result = await GetModelConfigurationAsync(modelConfig, hardCodedProps);
                    await uow.CompleteAsync();
                    return result;
                }                    
            });

            return result;
        }

        public async Task<ModelConfigurationDto> GetModelConfigurationAsync(string? @namespace, string name, List<PropertyMetadataDto>? hardCodedProps = null) 
        {
            var result = await GetModelConfigurationOrNullAsync(@namespace, name, hardCodedProps);
            return result ?? throw new ModelConfigurationNotFoundException(@namespace, name);
        }
    }
}