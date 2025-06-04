using Abp.AutoMapper;
using Abp.Collections.Extensions;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Services;
using Abp.Domain.Uow;
using Abp.Reflection;
using Abp.Runtime.Caching;
using AutoMapper;
using Shesha.Configuration.MappingMetadata;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Cache;
using Shesha.DynamicEntities.DbGenerator;
using Shesha.DynamicEntities.Dtos;
using Shesha.DynamicEntities.Exceptions;
using Shesha.DynamicEntities.TypeFinder;
using Shesha.EntityReferences;
using Shesha.Extensions;
using Shesha.Metadata;
using Shesha.Metadata.Dtos;
using Shesha.Permissions;
using Shesha.Reflection;
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
        private enum ModelUpdateType
        {
            /// <summary>
            /// Update all available properties
            /// </summary>
            AllProperties = 0,

            /// <summary>
            /// Update only decorate properties
            /// </summary>
            DecorProperties = 1,

            /// <summary>
            /// Update only data type properties
            /// </summary>
            TypeProperties = 2,
        }

        private readonly IRepository<EntityConfig, Guid> _entityConfigRepository;
        private readonly IRepository<ConfigurationItem, Guid> _configurationItemRepository;
        private readonly IRepository<EntityProperty, Guid> _entityPropertyRepository;
        private readonly IPermissionedObjectManager _permissionedObjectManager;
        private readonly IShaTypeFinder _typeFinder;
        private readonly IHardcodeMetadataProvider _metadataProvider;
        private readonly IMappingMetadataProvider _mappingMetadataProvider;
        private readonly IRepository<Domain.ConfigurationItems.Module, Guid> _moduleRepository;
        private readonly ITypedCache<string, ModelConfigurationDto?> _modelConfigsCache;
        private readonly IDynamicEntitiesDbGenerator _dbGenerator;
        private readonly IModuleList _moduleList;

        private readonly IMapper _propertyCopy;

        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public ModelConfigurationManager(
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IRepository<EntityProperty, Guid> entityPropertyRepository,
            IPermissionedObjectManager permissionedObjectManager,
            IShaTypeFinder typeFinder,
            IHardcodeMetadataProvider metadataProvider,
            IRepository<ConfigurationItem, Guid> configurationItemRepository,
            IMappingMetadataProvider mappingMetadataProvider,
            IRepository<Domain.ConfigurationItems.Module, Guid> moduleRepository,
            IModelConfigsCacheHolder modelConfigsCacheHolder,
            IUnitOfWorkManager unitOfWorkManager,
            IDynamicEntitiesDbGenerator dbGenerator,
            IModuleList moduleList
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
            _modelConfigsCache = modelConfigsCacheHolder.Cache;
            _unitOfWorkManager = unitOfWorkManager;
            _dbGenerator = dbGenerator;
            _moduleList = moduleList;

            var propertyCopyMapping = new MapperConfiguration(cfg =>
            {
                // Fix bug of Automapper < 11.0.0 under .net 7 https://stackoverflow.com/questions/74730425/system-datetime-on-t-maxintegertsystem-collections-generic-ienumerable1t
                cfg.ShouldMapMethod = (m) => { return false; };

                var mapExpression = cfg.CreateMap<ModelPropertyDto, ModelPropertyDto>()
                    .ForMember(d => d.Id, o => o.Ignore());
            });

            _propertyCopy = propertyCopyMapping.CreateMapper();
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

            await _modelConfigsCache.RemoveAsync($"{destination.Namespace}|{destination.ClassName}");
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
                    var vconfig = destination.ViewConfigurations.FirstOrDefault(x => x.Type == configuration.Type);
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

        private async Task CopyPropertiesAsync(EntityConfig destination, List<EntityProperty>? destPs, List<EntityProperty> sourcePs, EntityProperty? parent)
        {
            foreach (var prop in sourcePs)
            {
                var destProp = destPs?.FirstOrDefault(x => x.Name == prop.Name);
                if (destProp == null && prop.Source == MetadataSourceType.UserDefined)
                {
                    destProp = new EntityProperty()
                    {
                        Name = prop.Name,
                        // ToDo: AS - check how to copy these props
                        //ColumnName = prop.Name,
                        //CreatedInDb = prop.CreatedInDb,
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
                        await CopyPropertiesAsync(destination, destProp.Properties?.ToList(), prop.Properties.ToList(), destProp);
                }
            }
        }

        private async Task CopyPropertiesAsync(EntityConfig source, EntityConfig destination)
        {
            var destProps = await _entityPropertyRepository.GetAll().Where(x => x.EntityConfig.Id == destination.Id).ToListAsync();
            var sourceProps = await _entityPropertyRepository.GetAll().Where(x => x.EntityConfig.Id == source.Id).ToListAsync();

            await CopyPropertiesAsync(destination, destProps, sourceProps, null);
        }

        private async Task CopyPermissionsAsync(EntityConfig source, EntityConfig destination)
        {
            var copyPermission = async (string method, string type) =>
            {
                var sourcePermission = await _permissionedObjectManager.GetOrDefaultAsync($"{source.FullClassName}{method}", type);
                var destinationPermission = await _permissionedObjectManager.GetOrDefaultAsync($"{destination.FullClassName}{method}", type);
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
            // update Properties
            var toUpdate = _entityPropertyRepository.GetAll().Where(x => x.EntityType == source.FullClassName);
            foreach (var entity in toUpdate)
            {
                entity.EntityType = destination.FullClassName;
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
                        await _mappingMetadataProvider.UpdateClassNamesAsync(entityType, jsonProps, source.FullClassName, destination.FullClassName, true);
                    }
                    catch { /* hide exception for entities without tables */ }

                if (genericProps.Any())
                    try
                    {
                        await _mappingMetadataProvider.UpdateClassNamesAsync(entityType, genericProps, source.FullClassName, destination.FullClassName, false);
                    }
                    catch { /* hide exception for entities without tables */ }
            }
        }

        private List<ModelPropertyDto> OverrideProperties(List<ModelPropertyDto> properties)
        {
            return properties.Select(x =>
            {
                return new ModelPropertyDto()
                {
                    Source = MetadataSourceType.UserDefined,
                    InheritedFromId = x.Id.ToGuidOrNull(),
                    CreatedInDb = true,
                    ColumnName = x.ColumnName,

                    Name = x.Name,
                    Label = x.Label,
                    Description = x.Description,
                    Audited = x.Audited,
                    CascadeCreate = x.CascadeCreate,
                    CascadeUpdate = x.CascadeUpdate,
                    CascadeDeleteUnreferenced = x.CascadeDeleteUnreferenced,
                    DataFormat = x.DataFormat,
                    DataType = x.DataType,
                    EntityModule = x.EntityModule,
                    EntityType = x.EntityType,
                    Max = x.Max,
                    MaxLength = x.MaxLength,
                    Min = x.Min,
                    MinLength = x.MinLength,

                    // ToDo: AS - review
                    ModuleAccessor = x.ModuleAccessor,
                    Properties = x.Properties != null ? OverrideProperties(x.Properties) : x.Properties,

                    ReadOnly = x.ReadOnly,
                    ReferenceListModule = x.ReferenceListModule,
                    ReferenceListName = x.ReferenceListName,
                    RegExp = x.RegExp,
                    Required = x.Required,
                    SortOrder = x.SortOrder,
                    Suppress = x.Suppress,
                    TypeAccessor = x.TypeAccessor,
                    ValidationMessage = x.ValidationMessage,
                    IsFrameworkRelated = x.IsFrameworkRelated,
                };
            }).ToList();
        }

        public async Task<ModelConfigurationDto> CreateAsync(ModelConfigurationCreateDto input)
        {
            // todo: add validation

            var inheritedFrom = input.InheritedFromId != null
                ? await _entityConfigRepository.GetAsync(input.InheritedFromId.Value)
                : !input.InheritedFromClassName.IsNullOrEmpty() && !input.InheritedFromNamespace.IsNullOrEmpty()
                    ? await _entityConfigRepository.GetAll().FirstOrDefaultAsync(x => x.ClassName == input.InheritedFromClassName && x.Namespace == input.InheritedFromNamespace)
                    : null;

            if (inheritedFrom != null)
            {
                var inheritedFromModel = await GetModelConfigurationOrNullAsync(inheritedFrom);
                if (inheritedFromModel != null)
                {
                    var inheritedProps = OverrideProperties(inheritedFromModel.Properties);
                    input.Properties.AddRange(inheritedProps);
                }
            }

            var modelConfig = new EntityConfig();
            modelConfig.InheritedFrom = inheritedFrom;

            var module = await _moduleRepository.GetAsync(input.ModuleId ?? Guid.Empty);

            var dynamicNamespace = (module?.Name).IsNullOrEmpty() ? "ShaDynamic" : $"{module?.Name}.ShaDynamic";
            var discriminatorValue = (module?.Name).IsNullOrEmpty() ? $"ShaDynamic.{input.Name}" : $"{dynamicNamespace}.{input.Name}";

            var tablePrefix = module != null
                ? MappingHelper.GetTablePrefix((_moduleList.Modules.FirstOrDefault(x => x.ModuleInfo.Name == module.Name)?.Assembly).NotNull())
                : $"dynamic.{module?.Name.Replace(".", "_")}_{input.Name}";

            var modelDto = new ModelConfigurationDto
            {
                InheritedFromId = inheritedFrom?.Id,
                InheritedFromClassName = inheritedFrom?.ClassName,
                InheritedFromNamespace = inheritedFrom?.Namespace,

                TableName = inheritedFrom?.TableName ?? $"{tablePrefix}{input.Name}",
                DiscriminatorValue = discriminatorValue,

                FriendlyName = input.Name,

                ClassName = input.Name,
                Namespace = dynamicNamespace,
                GenerateAppService = true,
                AllowConfigureAppService = true,
                ModuleId = module?.Id,
                Module = module?.Name,
                Name = input.Name,
                Label = input.Label,
                Description = input.Description,
                VersionNo = 1,
                VersionStatus = ConfigurationItemVersionStatus.Live,
                Suppress = false,
                //NotImplemented = false,
                Source = MetadataSourceType.UserDefined,
                EntityConfigType = EntityConfigTypes.Class,

                Properties = input.Properties,
            };

            return await CreateOrUpdateAsync(modelConfig, modelDto);
        }

        public async Task<ModelConfigurationDto> UpdateAsync(ModelConfigurationDto input)
        {
            var modelConfig = await _entityConfigRepository.GetAll().Where(m => m.Id == input.Id).FirstOrDefaultAsync();
            if (modelConfig == null)
                throw new ModelConfigurationNotFoundException(input.Namespace, input.Name);

            /*if (modelConfig.Source == MetadataSourceType.UserDefined)
            {
                input.Namespace = "ShaDynamic";
                input.ClassName = input.Name;
            }*/

            // todo: add validation

            var res = await CreateOrUpdateAsync(modelConfig, input);
            await _modelConfigsCache.RemoveAsync($"{res.Namespace}|{res.ClassName}");

            return res;
        }

        private async Task<ModelConfigurationDto> CreateOrUpdateAsync(EntityConfig modelConfig, ModelConfigurationDto input)
        {
            var isNew = modelConfig.Id == Guid.Empty;

            var mapper = GetModelConfigMapper(isNew ? ModelUpdateType.AllProperties : ModelUpdateType.DecorProperties);
            mapper.Map(input, modelConfig);

            if (isNew)
            {
                modelConfig.Accessor = modelConfig.ClassName;

                // ToDo: Temporary
                modelConfig.VersionNo = 1;
                modelConfig.VersionStatus = ConfigurationItemVersionStatus.Live;

                modelConfig.Normalize();

                await _entityConfigRepository.InsertAsync(modelConfig);

                // ToDo: AS - decide if we will generate entities on fly
                //await _dbGenerator.ProcessEntityConfigAsync(modelConfig, new List<EntityProperty>()); // use empty list because properties will be processed later
            }
            else
            {
                await _entityConfigRepository.UpdateAsync(modelConfig);
            }

            var properties = await _entityPropertyRepository.GetAll().Where(p => p.EntityConfig == modelConfig).OrderBy(p => p.SortOrder).ToListAsync();

            var mappers = new Dictionary<ModelUpdateType, IMapper> {
                { ModelUpdateType.DecorProperties, GetPropertyMapper(ModelUpdateType.DecorProperties) },
                { ModelUpdateType.AllProperties, GetPropertyMapper(ModelUpdateType.AllProperties) }
            };

            await BindPropertiesAsync(mappers, properties, input.Properties, modelConfig, null);

            // delete missing properties
            var allPropertiesId = new List<Guid>();
            ActionPropertiesRecursive(input.Properties, prop =>
            {
                var propId = prop.Id.ToGuid();
                if (propId != Guid.Empty)
                    allPropertiesId.Add(propId);
            });
            var toDelete = properties.Where(p => !p.Name.IsSpecialProperty() && !allPropertiesId.Contains(p.Id)).ToList();
            foreach (var prop in toDelete)
            {
                var toReOvrrride = await _entityPropertyRepository.GetAll().Where(x => x.InheritedFrom == prop).ToListAsync();
                foreach (var reOverride in toReOvrrride)
                {
                    reOverride.InheritedFrom = null;
                    await _entityPropertyRepository.UpdateAsync(reOverride);
                }
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

            await _unitOfWorkManager.Current.SaveChangesAsync();

            var dto = await GetModelConfigurationOrNullAsync(modelConfig);
            if (dto != null)
            {
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
            }
            return dto.NotNull();
        }

        private IMapper GetModelConfigMapper(ModelUpdateType updateType)
        {
            var modelConfigMapperConfig = new MapperConfiguration(cfg =>
            {
                // Fix bug of Automapper < 11.0.0 under .net 7 https://stackoverflow.com/questions/74730425/system-datetime-on-t-maxintegertsystem-collections-generic-ienumerable1t
                cfg.ShouldMapMethod = (m) => { return false; };

                var mapExpression = cfg.CreateMap<ModelConfigurationDto, EntityConfig>()
                    .ForMember(d => d.Id, o => o.Ignore());

                if (updateType == ModelUpdateType.DecorProperties)
                {
                    mapExpression.ForMember(d => d.ClassName, s => s.Ignore());
                    mapExpression.ForMember(d => d.Namespace, s => s.Ignore());
                    mapExpression.ForMember(d => d.Module, s => s.Ignore());
                    mapExpression.ForMember(d => d.InheritedFrom, s => s.Ignore());
                }
                else
                {
                    mapExpression.ForMember(d => d.Module, s => s.MapFrom(p => p.ModuleId != null ? _moduleRepository.Get(p.ModuleId ?? Guid.Empty) : null));
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

        private async Task BindPropertiesAsync(Dictionary<ModelUpdateType, IMapper> mappers, List<EntityProperty> allProperties, List<ModelPropertyDto> inputProperties, EntityConfig modelConfig, EntityProperty? parentProperty)
        {
            if (inputProperties == null) return;
            var sortOrder = 0;
            foreach (var inputProp in inputProperties.OrderBy(x => x.SortOrder ?? int.MaxValue))
            {
                var propId = inputProp.Id.ToGuid();
                var isNew = propId == Guid.Empty;
                var dbProp = allProperties.FirstOrDefault(p => p.Id == propId)
                    ?? new EntityProperty { EntityConfig = modelConfig, Name = inputProp.Name};

                if (dbProp == null)
                    throw new EntityNotFoundException($"Property with id =`{inputProp.Id}` of entity `{modelConfig.Name}` not found. Unable to Add/Update");

                var propertyMapper = mappers[
                    dbProp.InheritedFrom != null 
                        ? ModelUpdateType.DecorProperties 
                        : dbProp.Source == MetadataSourceType.ApplicationCode
                            ? ModelUpdateType.DecorProperties
                            :ModelUpdateType.AllProperties
                    ];
                propertyMapper.Map(inputProp, dbProp);

                if (isNew)
                {
                    dbProp.ColumnName = inputProp.ColumnName ?? MappingHelper.GetColumnName(dbProp, _moduleList);
                    dbProp.ParentProperty = parentProperty;
                    dbProp.InheritedFrom = inputProp.InheritedFromId != null
                        ? await _entityPropertyRepository.GetAsync(inputProp.InheritedFromId.Value)
                        : null;
                }

                dbProp.SortOrder = sortOrder++;

                // bind child properties
                if (inputProp.Properties != null && inputProp.Properties.Any())
                    await BindPropertiesAsync(mappers, allProperties, inputProp.Properties, dbProp.EntityConfig, dbProp);

                await _entityPropertyRepository.InsertOrUpdateAsync(dbProp);

                // Add to inherited entities
                if (isNew)
                {
                    var inheritedEntities = await _entityConfigRepository.GetAll().Where(x => x.InheritedFrom == modelConfig).ToListAsync();
                    foreach(var inheritedEntity in inheritedEntities)
                    {
                        await BindPropertiesAsync(mappers, new List<EntityProperty>(), new List<ModelPropertyDto> { inputProp }, inheritedEntity, null);
                    }
                }
                // Update inherited entities
                else
                { 
                    var inheritedProperties = await _entityPropertyRepository.GetAll().Where(x => x.InheritedFrom == dbProp).ToListAsync();
                    foreach (var inheritedProperty in inheritedProperties)
                    {
                        var inhProp = _propertyCopy.Map<ModelPropertyDto>(inputProp);
                        inhProp.Id = inheritedProperty.Id.ToString();
                        await BindPropertiesAsync(mappers, new List<EntityProperty>() { inheritedProperty }, new List<ModelPropertyDto> { inhProp }, inheritedProperty.EntityConfig, null);
                    }
                }

                if (isNew)
                {
                    // ToDo: AS - decide if we will generate entities on fly
                    //await _dbGenerator.ProcessEntityPropertyAsync(dbProp);
                }
            }
        }

        private IMapper GetPropertyMapper(ModelUpdateType updateType)
        {
            var propertyMapperConfig = new MapperConfiguration(cfg =>
            {
                // Fix bug of Automapper < 11.0.0 under .net 7 https://stackoverflow.com/questions/74730425/system-datetime-on-t-maxintegertsystem-collections-generic-ienumerable1t
                cfg.ShouldMapMethod = (m) => { return false; };

                var mapExpression = cfg.CreateMap<ModelPropertyDto, EntityProperty>()
                    .ForMember(d => d.Id, o => o.Ignore())
                    .ForMember(d => d.InheritedFrom, o => o.Ignore())
                    .ForMember(d => d.EntityConfig, o => o.Ignore())
                    .ForMember(d => d.SortOrder, o => o.Ignore())
                    .ForMember(d => d.Properties, o => o.Ignore())
                    .ForMember(d => d.Source, o => o.Ignore())
                    .ForMember(d => d.Name, o => o.Ignore());

                /*if (updateType == PropertyUpdateType.TypeProperties)
                {
                    mapExpression.ForMember(d => d.Description, o => o.MapFrom((s, d) => d.Description == "Shurik" ? "Шурик" : s.Description));
                }*/

                if (updateType == ModelUpdateType.DecorProperties)
                {
                    mapExpression.ForMember(d => d.DataType, o => o.Ignore());
                    mapExpression.ForMember(d => d.DataFormat, o => o.Ignore());
                    mapExpression.ForMember(d => d.ItemsType, o => o.Ignore());
                    mapExpression.ForMember(d => d.EntityType, o => o.Ignore());
                }
            });

            return propertyMapperConfig.CreateMapper();
        }

        public async Task<ModelConfigurationDto?> GetModelConfigurationOrNullAsync(EntityConfig modelConfig, List<PropertyMetadataDto>? hardCodedProps = null)
        {
            var dto = ObjectMapper.Map<ModelConfigurationDto>(modelConfig);

            // Find first not deleted config (or null)
            var baseConfig = modelConfig.InheritedFrom;
            while (baseConfig != null && baseConfig.IsDeleted && baseConfig.InheritedFrom != null)
                baseConfig = baseConfig.InheritedFrom;

            dto.InheritedFromId = baseConfig?.Id;
            dto.InheritedFromClassName = baseConfig?.ClassName;
            dto.InheritedFromNamespace = baseConfig?.Namespace;

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

            dto.HardcodedPropertiesMD5 = modelConfig.HardcodedPropertiesMD5;
            
            var changeDates = properties.Select(p => p.LastModificationTime ?? p.CreationTime).ToList();
            changeDates.Add(modelConfig.LastModificationTime ?? modelConfig.CreationTime);
            dto.ChangeTime = changeDates.Max();

            dto.Permission = await _permissionedObjectManager.GetOrDefaultAsync($"{modelConfig.Namespace}.{modelConfig.ClassName}", ShaPermissionedObjectsTypes.Entity);
            dto.PermissionGet = await _permissionedObjectManager.GetOrDefaultAsync($"{modelConfig.Namespace}.{modelConfig.ClassName}@Get", ShaPermissionedObjectsTypes.EntityAction);
            dto.PermissionCreate = await _permissionedObjectManager.GetOrDefaultAsync($"{modelConfig.Namespace}.{modelConfig.ClassName}@Create", ShaPermissionedObjectsTypes.EntityAction);
            dto.PermissionUpdate = await _permissionedObjectManager.GetOrDefaultAsync($"{modelConfig.Namespace}.{modelConfig.ClassName}@Update", ShaPermissionedObjectsTypes.EntityAction);
            dto.PermissionDelete = await _permissionedObjectManager.GetOrDefaultAsync($"{modelConfig.Namespace}.{modelConfig.ClassName}@Delete", ShaPermissionedObjectsTypes.EntityAction);

            dto.NormalizeViewConfigurations(modelConfig);

            return dto;
        }

        public async Task<ModelConfigurationDto?> GetCachedModelConfigurationOrNullAsync(string @namespace, string className, List<PropertyMetadataDto>? hardCodedProps = null)
        {
            var cacheKey = $"{@namespace}|{className}";
            var result = await _modelConfigsCache.GetAsync(cacheKey, async () => {
                using (var uow = UnitOfWorkManager.Begin(System.Transactions.TransactionScopeOption.RequiresNew)) 
                {
                    var modelConfig = await _entityConfigRepository.GetAll().Where(m => m.ClassName == className && m.Namespace == @namespace && !m.IsDeleted).FirstOrDefaultAsync();
                    if (modelConfig == null)
                        return null;

                    var result = await GetModelConfigurationOrNullAsync(modelConfig, hardCodedProps);
                    await uow.CompleteAsync();
                    return result;
                }                    
            });

            return result;
        }

        public async Task<ModelConfigurationDto> GetCachedModelConfigurationAsync(string @namespace, string className, List<PropertyMetadataDto>? hardCodedProps = null) 
        {
            var result = await GetCachedModelConfigurationOrNullAsync(@namespace, className, hardCodedProps);
            return result ?? throw new ModelConfigurationNotFoundException(@namespace, className);
        }
    }
}