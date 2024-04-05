using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Services;
using Abp.Reflection;
using Abp.Runtime.Caching;
using AutoMapper;
using Shesha.Configuration.MappingMetadata;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Dtos;
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
        private readonly IMetadataProvider _metadataProvider;
        private readonly EntityModelProvider _entityModelProvider;
        private readonly IMappingMetadataProvider _mappingMetadataProvider;
        private readonly ICacheManager _cacheManager;
        private readonly IRepository<Domain.ConfigurationItems.Module, Guid> _moduleRepository;

        public ITypedCache<string, ModelConfigurationDto> ModelConfigsCache =>
            _cacheManager.GetCache<string, ModelConfigurationDto>($"{this.GetType().Name}_models");

        public ModelConfigurationManager(
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IRepository<EntityProperty, Guid> entityPropertyRepository,
            IPermissionedObjectManager permissionedObjectManager,
            ITypeFinder typeFinder,
            IMetadataProvider metadataProvider,
            EntityModelProvider entityModelProvider,
            IRepository<ConfigurationItem, Guid> configurationItemRepository,
            IMappingMetadataProvider mappingMetadataProvider,
            ICacheManager cacheManager,
            IRepository<Domain.ConfigurationItems.Module, Guid> moduleRepository
            )
        {
            _entityConfigRepository = entityConfigRepository;
            _entityPropertyRepository = entityPropertyRepository;
            _permissionedObjectManager = permissionedObjectManager;
            _typeFinder = typeFinder;
            _metadataProvider = metadataProvider;
            _entityModelProvider = entityModelProvider;
            _configurationItemRepository = configurationItemRepository;
            _mappingMetadataProvider = mappingMetadataProvider;
            _cacheManager = cacheManager;
            _moduleRepository = moduleRepository;
        }

        public async Task MergeConfigurationsAsync(EntityConfig source, EntityConfig destination, bool deleteAfterMerge, bool deepUpdate)
        {
            // Copy main data
            destination.Label = source.Label;
            destination.GenerateAppService = source.GenerateAppService;

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
                await _entityPropertyRepository.DeleteAsync(x => x.EntityConfig.Id == source.Id);
                await _configurationItemRepository.DeleteAsync(source.Id);
            }

            await ModelConfigsCache.RemoveAsync($"{destination.Namespace}|{destination.ClassName}");
        }

        private void CopyViewConfigs(EntityConfig source, EntityConfig destination)
        {
            // update only empty ViewConfigurations
            if (source.ViewConfigurations != null)
            {
                if (destination.ViewConfigurations == null)
                    destination.ViewConfigurations = new List<EntityViewConfigurationDto>();

                foreach (var configuration in source.ViewConfigurations)
                {
                    var vconfig = destination.ViewConfigurations?.FirstOrDefault(x => x.Type == configuration.Type);
                    if (vconfig == null)
                    {
                        destination.ViewConfigurations.Add(
                            new EntityViewConfigurationDto()
                            {
                                Type = configuration.Type,
                                FormId = new FormIdFullNameDto()
                                {
                                    Name = configuration.FormId?.Name,
                                    Module = configuration.FormId?.Module
                                },
                                IsStandard = configuration.IsStandard,
                            });
                    }
                    else if (vconfig.FormId.IsEmpty())
                    {
                        vconfig.FormId = new FormIdFullNameDto()
                        {
                            Name = configuration.FormId?.Name,
                            Module = configuration.FormId?.Module
                        };
                    }
                }
            }
        }

        private async Task CopyPropertiesAsync(EntityConfig source, EntityConfig destination)
        {
            var destProps = await _entityPropertyRepository.GetAll().Where(x => x.EntityConfig.Id == destination.Id).ToListAsync();
            var sourceProps = await _entityPropertyRepository.GetAll().Where(x => x.EntityConfig.Id == source.Id).ToListAsync();

            Func<List<EntityProperty>, List<EntityProperty>, EntityProperty, Task> copyProps = null;
            copyProps = async (List<EntityProperty> destPs, List<EntityProperty> sourcePs, EntityProperty parent) =>
            {
                foreach (var prop in sourcePs)
                {
                    var destProp = destPs?.FirstOrDefault(x => x.Name == prop.Name);
                    if (destProp == null && prop.Source == MetadataSourceType.UserDefined)
                    {
                        destProp = new EntityProperty()
                        {
                            Name = prop.Name,
                            EntityConfig = destination,
                            DataType = prop.DataType,
                            DataFormat = prop.DataFormat,
                            EntityType = prop.EntityType,
                            IsFrameworkRelated = prop.IsFrameworkRelated,
                            ItemsType = prop.ItemsType,
                            ReferenceListName = prop.ReferenceListName,
                            ReferenceListModule = prop.ReferenceListModule,
                            Source = destination.Source == MetadataSourceType.ApplicationCode ? prop.Source : MetadataSourceType.UserDefined,
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
                            await copyProps(destProp.Properties?.ToList(), prop.Properties.ToList(), destProp);
                    }
                }
            };

            await copyProps(destProps, sourceProps, null);
        }

        private async Task CopyPermissionsAsync(EntityConfig source, EntityConfig destination)
        {
            var copyPermission = async (string method, string type) =>
            {
                var sourcePermission = await _permissionedObjectManager.GetAsync($"{source.FullClassName}{method}");
                var destinationPermission = await _permissionedObjectManager.GetAsync($"{destination.FullClassName}{method}");
                destinationPermission.Access = sourcePermission.Access;
                destinationPermission.Type = type;
                sourcePermission.Permissions.ToList().ForEach(x =>
                {
                    if (!destinationPermission.Permissions.Contains(x))
                        destinationPermission.Permissions.Add(x);
                });
                await _permissionedObjectManager.SetAsync(destinationPermission);
            };

            await copyPermission("", PermissionedObjectsSheshaTypes.Entity);
            await copyPermission("@Get", PermissionedObjectsSheshaTypes.EntityAction);
            await copyPermission("@Create", PermissionedObjectsSheshaTypes.EntityAction);
            await copyPermission("@Update", PermissionedObjectsSheshaTypes.EntityAction);
            await copyPermission("@Delete", PermissionedObjectsSheshaTypes.EntityAction);
        }

        private async Task DeepUpdateAsync(EntityConfig source, EntityConfig destination)
        {
            // update Properties
            var toUpdate = _entityPropertyRepository.GetAll().Where(x => x.EntityType == source.FullClassName);
            foreach (var entity in toUpdate)
            {
                entity.EntityType = destination.FullClassName;
                _entityPropertyRepository.Update(entity);
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
                        await _mappingMetadataProvider.UpdateClassNames(entityType, jsonProps, source.FullClassName, destination.FullClassName, true);
                    }
                    catch { /* hide exception for entities without tables */ }

                if (genericProps.Any())
                    try
                    {
                        await _mappingMetadataProvider.UpdateClassNames(entityType, genericProps, source.FullClassName, destination.FullClassName, false);
                    }
                    catch { /* hide exception for entities without tables */ }
            }
        }

        public async Task<ModelConfigurationDto> CreateAsync(ModelConfigurationDto input)
        {
            var modelConfig = new EntityConfig();

            input.Namespace = "Dynamic";
            input.ClassName = input.Name;

            // todo: add validation

            return await CreateOrUpdateAsync(modelConfig, input, true);
        }

        public async Task<ModelConfigurationDto> UpdateAsync(ModelConfigurationDto input)
        {
            var modelConfig = await _entityConfigRepository.GetAll().Where(m => m.Id == input.Id).FirstOrDefaultAsync();
            if (modelConfig == null)
                new EntityNotFoundException("Model configuration not found");

            if (modelConfig.Source == MetadataSourceType.UserDefined)
            {
                input.Namespace = "Dynamic";
                input.ClassName = input.Name;
            }

            // todo: add validation

            var res = await CreateOrUpdateAsync(modelConfig, input, false);
            await ModelConfigsCache.RemoveAsync($"{res.Namespace}|{res.ClassName}");

            return res;
        }

        private async Task<ModelConfigurationDto> CreateOrUpdateAsync(EntityConfig modelConfig, ModelConfigurationDto input, bool create)
        {
            var mapper = GetModelConfigMapper(modelConfig.Source ?? Domain.Enums.MetadataSourceType.UserDefined);
            mapper.Map(input, modelConfig);

            var module = input.ModuleId.HasValue
                ? await _moduleRepository.GetAsync(input.ModuleId.Value)
                : null;

            modelConfig.Module = module;

            // ToDo: Temporary
            modelConfig.VersionNo = 1;
            modelConfig.VersionStatus = ConfigurationItemVersionStatus.Live;

            modelConfig.Normalize();

            if (create)
            {
                await _entityConfigRepository.InsertAsync(modelConfig);
            }
            else
            {
                await _entityConfigRepository.UpdateAsync(modelConfig);
            }

            var properties = await _entityPropertyRepository.GetAll().Where(p => p.EntityConfig == modelConfig).OrderBy(p => p.SortOrder).ToListAsync();

            var mappers = new Dictionary<MetadataSourceType, IMapper> {
                { MetadataSourceType.ApplicationCode, GetPropertyMapper(MetadataSourceType.ApplicationCode) },
                { MetadataSourceType.UserDefined, GetPropertyMapper(MetadataSourceType.UserDefined) }
            };

            await BindProperties(mappers, properties, input.Properties, modelConfig, null);

            // delete missing properties
            var allPropertiesId = new List<Guid>();
            ActionPropertiesRecursive(input.Properties, prop =>
            {
                var id = prop.Id.ToGuidOrNull();
                if (id != null)
                    allPropertiesId.Add(id.Value);
            });
            var toDelete = properties.Where(p => !allPropertiesId.Contains(p.Id)).ToList();
            foreach (var prop in toDelete)
            {
                await _entityPropertyRepository.DeleteAsync(prop);
            }

            if (input.Permission != null)
            {
                input.Permission.Type = PermissionedObjectsSheshaTypes.Entity;
                await _permissionedObjectManager.SetAsync(input.Permission);
            }
            if (input.PermissionGet != null)
            {
                input.PermissionGet.Type = PermissionedObjectsSheshaTypes.EntityAction;
                await _permissionedObjectManager.SetAsync(input.PermissionGet);
            }
            if (input.PermissionCreate != null)
            {
                input.PermissionCreate.Type = PermissionedObjectsSheshaTypes.EntityAction;
                await _permissionedObjectManager.SetAsync(input.PermissionCreate);
            }
            if (input.PermissionUpdate != null)
            {
                input.PermissionUpdate.Type = PermissionedObjectsSheshaTypes.EntityAction;
                await _permissionedObjectManager.SetAsync(input.PermissionUpdate);
            }
            if (input.PermissionDelete != null)
            {
                input.PermissionDelete.Type = PermissionedObjectsSheshaTypes.EntityAction;
                await _permissionedObjectManager.SetAsync(input.PermissionDelete);
            }

            return await GetModelConfigurationAsync(modelConfig);
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
                    mapExpression.ForMember(d => d.ClassName, o => o.Ignore());
                    mapExpression.ForMember(d => d.Namespace, o => o.Ignore());
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

        private async Task BindProperties(Dictionary<MetadataSourceType, IMapper> mappers, List<EntityProperty> allProperties, List<ModelPropertyDto> inputProperties, EntityConfig modelConfig, EntityProperty parentProperty)
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
                        EntityConfig = modelConfig,
                    };
                dbProp.ParentProperty = parentProperty;

                var propertyMapper = mappers[dbProp.Source ?? MetadataSourceType.UserDefined];
                propertyMapper.Map(inputProp, dbProp);

                // bind child properties
                if (inputProp.Properties != null && inputProp.Properties.Any())
                    await BindProperties(mappers, allProperties, inputProp.Properties, modelConfig, dbProp);

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
                    .ForMember(d => d.EntityConfig, o => o.Ignore())
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

        public async Task<ModelConfigurationDto> GetModelConfigurationAsync(EntityConfig modelConfig, List<PropertyMetadataDto> hardCodedProps = null)
        {
            var dto = ObjectMapper.Map<ModelConfigurationDto>(modelConfig);

            var properties = await _entityPropertyRepository.GetAll()
                .Where(p => p.EntityConfig == modelConfig && p.ParentProperty == null)
                .OrderBy(p => p.SortOrder).ToListAsync();

            dto.Properties = properties.Select(p => ObjectMapper.Map<ModelPropertyDto>(p)).OrderBy(x => x.SortOrder).ToList();

            var containerType = _typeFinder.Find(x => x.Namespace == modelConfig.Namespace && x.Name == modelConfig.ClassName).FirstOrDefault();

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
                        prop.Suppress = !hardCodedProp.IsVisible || prop.Suppress;
                        prop.Required = hardCodedProp.Required || prop.Required;
                        prop.ReadOnly = hardCodedProp.Readonly || prop.ReadOnly;
                        prop.Audited = hardCodedProp.Audited || prop.Audited;
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

            dto.MD5 = modelConfig.PropertiesMD5;
            
            var changeDates = properties.Select(p => p.LastModificationTime ?? p.CreationTime).ToList();
            changeDates.Add(modelConfig.LastModificationTime ?? modelConfig.CreationTime);
            dto.ChangeTime = changeDates.Max();

            dto.Permission = await _permissionedObjectManager.GetAsync($"{modelConfig.Namespace}.{modelConfig.ClassName}");
            dto.PermissionGet = await _permissionedObjectManager.GetAsync($"{modelConfig.Namespace}.{modelConfig.ClassName}@Get");
            dto.PermissionCreate = await _permissionedObjectManager.GetAsync($"{modelConfig.Namespace}.{modelConfig.ClassName}@Create");
            dto.PermissionUpdate = await _permissionedObjectManager.GetAsync($"{modelConfig.Namespace}.{modelConfig.ClassName}@Update");
            dto.PermissionDelete = await _permissionedObjectManager.GetAsync($"{modelConfig.Namespace}.{modelConfig.ClassName}@Delete");

            dto.NormalizeViewConfigurations(modelConfig);

            return dto;
        }

        public async Task<ModelConfigurationDto> GetModelConfigurationOrNullAsync(string @namespace, string name, List<PropertyMetadataDto> hardCodedProps = null)
        {
            var cacheKey = $"{@namespace}|{name}";
            var result = await ModelConfigsCache.GetAsync(cacheKey, async () => {
                var modelConfig = await _entityConfigRepository.GetAll().Where(m => m.ClassName == name && m.Namespace == @namespace && !m.IsDeleted).FirstOrDefaultAsync();
                if (modelConfig == null)
                    return null;

                return await GetModelConfigurationAsync(modelConfig, hardCodedProps);
            });

            return result;
        }
    }
}
