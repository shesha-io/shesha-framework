using Abp.Collections.Extensions;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Services;
using Abp.Domain.Uow;
using Abp.Runtime.Caching;
using AutoMapper;
using Shesha.Domain;
using Shesha.Domain.EntityPropertyConfiguration;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Cache;
using Shesha.DynamicEntities.DbGenerator;
using Shesha.DynamicEntities.Dtos;
using Shesha.DynamicEntities.EntityTypeBuilder;
using Shesha.DynamicEntities.Exceptions;
using Shesha.DynamicEntities.TypeFinder;
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

        // ToDo: AS - decide if we will generate entities on fly
        private readonly bool metadataRefresh = false;

        private readonly IRepository<EntityConfig, Guid> _entityConfigRepository;
        private readonly IRepository<EntityProperty, Guid> _entityPropertyRepository;
        private readonly IPermissionedObjectManager _permissionedObjectManager;
        private readonly IShaTypeFinder _typeFinder;
        private readonly IHardcodeMetadataProvider _metadataProvider;
        private readonly IRepository<Domain.Module, Guid> _moduleRepository;
        private readonly ITypedCache<string, ModelConfigurationDto?> _modelConfigsCache;
        private readonly IModuleList _moduleList;
        private readonly IDynamicEntitiesDbGenerator _dbGenerator;

        private readonly IMapper _propertyCopy;

        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public ModelConfigurationManager(
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IRepository<EntityProperty, Guid> entityPropertyRepository,
            IPermissionedObjectManager permissionedObjectManager,
            IShaTypeFinder typeFinder,
            IHardcodeMetadataProvider metadataProvider,
            IRepository<Domain.Module, Guid> moduleRepository,
            IModelConfigsCacheHolder modelConfigsCacheHolder,
            IUnitOfWorkManager unitOfWorkManager,
            IModuleList moduleList,
            IDynamicEntitiesDbGenerator dbGenerator
            )
        {
            _entityConfigRepository = entityConfigRepository;
            _entityPropertyRepository = entityPropertyRepository;
            _permissionedObjectManager = permissionedObjectManager;
            _typeFinder = typeFinder;
            _metadataProvider = metadataProvider;
            _moduleRepository = moduleRepository;
            _modelConfigsCache = modelConfigsCacheHolder.Cache;
            _unitOfWorkManager = unitOfWorkManager;
            _moduleList = moduleList;
            _dbGenerator = dbGenerator;

            var propertyCopyMapping = new MapperConfiguration(cfg =>
            {
                // Fix bug of Automapper < 11.0.0 under .net 7 https://stackoverflow.com/questions/74730425/system-datetime-on-t-maxintegertsystem-collections-generic-ienumerable1t
                cfg.ShouldMapMethod = (m) => { return false; };

                var mapExpression = cfg.CreateMap<ModelPropertyDto, ModelPropertyDto>()
                    .ForMember(d => d.Id, o => o.Ignore());
            });

            _propertyCopy = propertyCopyMapping.CreateMapper();
        }

        private List<ModelPropertyDto> OverrideProperties(List<ModelPropertyDto> properties)
        {
            return properties.Select(x =>
            {
                var prop = new ModelPropertyDto()
                {
                    Source = MetadataSourceType.UserDefined,
                    InheritedFromId = x.Id.ToGuidOrNull(),
                    CreatedInDb = true,
                    ColumnName = x.ColumnName,
                    IsItemsType = x.IsItemsType,

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

                    Properties = x.Properties != null ? OverrideProperties(x.Properties) : new List<ModelPropertyDto>(),

                    ReadOnly = x.ReadOnly,
                    ReferenceListId = x.ReferenceListId != null ? new ReferenceListIdentifier(x.ReferenceListId.Module, x.ReferenceListId.Name) : null,
                    RegExp = x.RegExp,
                    Required = x.Required,
                    SortOrder = x.SortOrder,
                    Suppress = x.Suppress,
                    TypeAccessor = x.TypeAccessor,
                    ValidationMessage = x.ValidationMessage,
                    IsFrameworkRelated = x.IsFrameworkRelated,

                    Formatting = x.Formatting.GetFullCopyViaJson(),
                    ListConfiguration = x.ListConfiguration.GetFullCopyViaJson(),
                };

                prop.ItemsType = x.ItemsType != null
                    ? prop.Properties?.FirstOrDefault(y => y.InheritedFromId == x.ItemsType.Id.ToGuidOrNull())
                    : null;

                return prop;
            }).ToList();
        }

        [UnitOfWork]
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

            var modelConfig = new EntityConfig()
            { 
                InheritedFrom = inheritedFrom,
            };

            var module = input.ModuleId != null ? await _moduleRepository.GetAsync(input.ModuleId.Value) : null;

            var dynamicNamespace = (module?.Accessor).IsNullOrEmpty() ? DynamicEntityTypeBuilder.SheshaDynamicNamespace : $"{module?.Accessor}.{DynamicEntityTypeBuilder.SheshaDynamicNamespace}";
            var discriminatorValue = (module?.Accessor).IsNullOrEmpty() ? input.Name : $"{dynamicNamespace}.{input.Name}";

            // ToDo: AS V1 - get correct prefix from name conventions
            var schemaName = module != null
                ? MappingHelper.GetTablePrefix((_moduleList.Modules.FirstOrDefault(x => x.ModuleInfo.Name == module.Name)?.Assembly).NotNull())
                : null;
            schemaName = schemaName.IsNullOrEmpty() 
                ? (module?.Accessor).IsNullOrEmpty()
                    ? module?.Name.ToCamelCase()
                    : module?.Accessor
                : schemaName;
            schemaName = schemaName.NotNull().TrimEnd('_');

            var modelDto = new ModelConfigurationDto
            {
                InheritedFromId = inheritedFrom?.Id,
                InheritedFromClassName = inheritedFrom?.ClassName,
                InheritedFromNamespace = inheritedFrom?.Namespace,

                // ToDo: AS - use name conventions
                SchemaName = inheritedFrom != null ? inheritedFrom.SchemaName : schemaName.ToSnakeCase(),
                TableName = inheritedFrom != null ? inheritedFrom.TableName : input.Name.ToSnakeCase(),
                DiscriminatorValue = discriminatorValue,

                ClassName = input.Name,
                Namespace = dynamicNamespace,
                GenerateAppService = true,
                AllowConfigureAppService = true,
                ModuleId = module?.Id,
                Module = module?.Name,
                Name = input.Name,
                Label = input.Label,
                Description = input.Description,
                Suppress = false,
                //NotImplemented = false,
                Source = MetadataSourceType.UserDefined,
                EntityConfigType = input.EntityConfigType,

                Properties = input.Properties,
            };

            return await CreateOrUpdateAsync(modelConfig, modelDto, true);
        }

        [UnitOfWork]
        public async Task<ModelConfigurationDto> UpdateAsync(ModelConfigurationDto input)
        {
            var modelConfig = await _entityConfigRepository.GetAll().Where(m => m.Id == input.Id).FirstOrDefaultAsync();
            if (modelConfig == null)
                throw new ModelConfigurationNotFoundException(input.Namespace, input.Name);

            // todo: add validation

            var res = await CreateOrUpdateAsync(modelConfig, input, false);
            await _modelConfigsCache.RemoveAsync($"{res.Namespace}|{res.ClassName}");

            return res;
        }

        [UnitOfWork]
        private async Task<ModelConfigurationDto> CreateOrUpdateAsync(EntityConfig entityConfig, ModelConfigurationDto input, bool isNew)
        {
            // ToDo: AS - Think if we allow to change name because there can be created inherited classes
            //config.Name = config.CreatedInDb ? config.Name : dto.Name; // update only if the property is not created in DB yet

            if (isNew)
            {
                entityConfig.DiscriminatorValue = input.DiscriminatorValue;
                entityConfig.SchemaName = input.SchemaName;
                entityConfig.TableName = input.TableName;
                entityConfig.Name = input.Name;
                entityConfig.ClassName = input.ClassName;
                entityConfig.Namespace = input.Namespace;
                entityConfig.Module = input.ModuleId != null ? await _moduleRepository.GetAsync(input.ModuleId.Value) : null;
                entityConfig.EntityConfigType = input.EntityConfigType;
                entityConfig.Normalize();

                await _entityConfigRepository.InsertAsync(entityConfig);
            }

            entityConfig.Label = input.Label;
            entityConfig.Description = input.Description;
            entityConfig.GenerateAppService = input.GenerateAppService;
            entityConfig.Accessor = input.ClassName;
            entityConfig.ViewConfigurations = input.ViewConfigurations;

            await _entityConfigRepository.UpdateAsync(entityConfig);

            if (isNew && metadataRefresh)
                  await _dbGenerator.ProcessEntityConfigAsync(entityConfig, new List<EntityProperty>()); // use empty list because properties will be processed later

            var properties = await _entityPropertyRepository.GetAll().Where(p => p.EntityConfig == entityConfig).OrderBy(p => p.SortOrder).ToListAsync();

            var mappers = new Dictionary<ModelUpdateType, IMapper> {
                { ModelUpdateType.DecorProperties, GetPropertyMapper(ModelUpdateType.DecorProperties) },
                { ModelUpdateType.AllProperties, GetPropertyMapper(ModelUpdateType.AllProperties) }
            };

            await BindPropertiesAndReturnItemsTypeAsync(mappers, properties, input.Properties, entityConfig, null, false, new List<EntityProperty>());

            // delete missing properties
            var allPropertiesId = new List<Guid>();
            ActionPropertiesRecursive(input.Properties, prop =>
            {
                var propId = prop.Id.ToGuid();
                if (propId != Guid.Empty)
                    allPropertiesId.Add(propId);
            });
            var toDelete = properties.Where(p => !p.Name.IsSpecialProperty() && !allPropertiesId.Contains(p.Id) && p.InheritedFrom == null).ToList();
            foreach (var prop in toDelete)
            {
                // ToDo: AS - review if we should remove inheritance of the properties
                var toReOverride = await _entityPropertyRepository.GetAll().Where(x => x.InheritedFrom == prop).ToListAsync();
                foreach (var reOverride in toReOverride)
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

            var dto = await GetModelConfigurationOrNullAsync(entityConfig);
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

        private async Task<EntityProperty?> BindPropertiesAndReturnItemsTypeAsync(
            Dictionary<ModelUpdateType, IMapper> mappers, 
            List<EntityProperty> allProperties,
            List<ModelPropertyDto> inputProperties, 
            EntityConfig entityConfig, 
            EntityProperty? parentProperty,
            bool inherited,
            List<EntityProperty> inheritedFromProperties
        )
        {
            EntityProperty? itemsType = null;
            if (inputProperties == null) return itemsType;

            var sortOrder = 0;
            foreach (var inputProp in inputProperties.OrderBy(x => x.SortOrder ?? int.MaxValue))
            {
                var propId = inputProp.Id.ToGuid();
                var dbProp = inherited
                    ? allProperties.FirstOrDefault(p => p.Name == inputProp.Name)
                    : allProperties.FirstOrDefault(p => p.Id == propId);

                var inheritedFromProp = inheritedFromProperties.FirstOrDefault(p => p.Name == inputProp.Name);

                var isNew = propId == Guid.Empty && dbProp == null;

                if (!isNew && dbProp == null)
                    throw new EntityNotFoundException($"Property with id =`{inputProp.Id}` of entity `{entityConfig.Name}` not found. Unable to Add/Update");

                dbProp = dbProp ?? new EntityProperty { EntityConfig = entityConfig, Name = inputProp.Name };

                var propertyMapper = mappers[
                    dbProp.InheritedFrom != null
                        ? ModelUpdateType.DecorProperties
                        : dbProp.Source == MetadataSourceType.ApplicationCode
                            ? ModelUpdateType.DecorProperties
                            : ModelUpdateType.AllProperties
                    ];

                // clear itemsType because will get relevant property from the properties list
                inputProp.ItemsType = null;

                propertyMapper.Map(inputProp, dbProp);

                if (dbProp.DataType == DataTypes.Array)
                {
                    if (dbProp.DataFormat == ArrayFormats.EntityReference)
                    {
                        dbProp.ListConfiguration = dbProp.ListConfiguration ?? new EntityPropertyListConfiguration();
                        dbProp.ListConfiguration.MappingType = EntityPropertyListConfiguration.ManyToOne;
                    }
                    if (dbProp.DataFormat == ArrayFormats.ManyToManyEntities)
                    {
                        dbProp.ListConfiguration = dbProp.ListConfiguration ?? new EntityPropertyListConfiguration();
                        dbProp.ListConfiguration.MappingType = EntityPropertyListConfiguration.ManyToMany;
                    }
                }

                if (isNew)
                {
                    dbProp.ParentProperty = parentProperty;
                    dbProp.InheritedFrom = inputProp.InheritedFromId != null
                        ? await _entityPropertyRepository.GetAsync(inputProp.InheritedFromId.Value)
                        : inherited
                            ? inheritedFromProp
                            : null;

                    parentProperty?.Properties.Add(dbProp);
                }

                // ToDo: AS V1 - use name conventions
                // use ColumnName only for root properties (nested proprties is always stored as Json and must not mapped to DB)
                dbProp.ColumnName = parentProperty == null
                    ? dbProp.CreatedInDb // update only if the property is not created in DB yet
                        ? dbProp.ColumnName
                        : inputProp.ColumnName ?? MappingHelper.GetColumnName(dbProp, _moduleList).ToSnakeCase()
                    : null;

                dbProp.SortOrder = sortOrder++;

                if (inputProp.ReferenceListId != null)
                {
                    dbProp.ReferenceListModule = inputProp.ReferenceListId.Module;
                    dbProp.ReferenceListName = inputProp.ReferenceListId.Name;
                }

                // bind child properties
                if (inputProp.Properties != null && inputProp.Properties.Any())
                {
                    dbProp.ItemsType = await BindPropertiesAndReturnItemsTypeAsync(
                        mappers,
                        dbProp.Properties.ToList(),
                        inputProp.Properties,
                        dbProp.EntityConfig,
                        dbProp,
                        inherited,
                        inheritedFromProp?.Properties.ToList() ?? new List<EntityProperty>()
                    );
                    if (!(dbProp.ItemsType?.ReferenceListName).IsNullOrEmpty())
                    {
                        dbProp.ReferenceListModule = dbProp.ItemsType?.ReferenceListModule;
                        dbProp.ReferenceListName = dbProp.ItemsType?.ReferenceListName;
                    }
                }

                await _entityPropertyRepository.InsertOrUpdateAsync(dbProp);

                if (parentProperty == null)
                {
                    // Add to inherited entities
                    if (isNew)
                    {
                        var inheritedEntities = await _entityConfigRepository.GetAll().Where(x => x.InheritedFrom == entityConfig).ToListAsync();
                        foreach (var inheritedEntity in inheritedEntities)
                        {
                            await BindPropertiesAndReturnItemsTypeAsync(
                                mappers,
                                new List<EntityProperty>(),
                                new List<ModelPropertyDto> { inputProp },
                                inheritedEntity,
                                null,
                                true,
                                new List<EntityProperty> { dbProp }
                            );

                            await _modelConfigsCache.RemoveAsync($"{inheritedEntity.Namespace}|{inheritedEntity.ClassName}");
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
                            //inhProp.Properties = new List<ModelPropertyDto>();
                            await BindPropertiesAndReturnItemsTypeAsync(
                                mappers, 
                                new List<EntityProperty>() { inheritedProperty }, 
                                new List<ModelPropertyDto> { inhProp },
                                inheritedProperty.EntityConfig,
                                inheritedProperty.ParentProperty,
                                true,
                                new List<EntityProperty> { dbProp }
                            );

                            await _modelConfigsCache.RemoveAsync($"{inheritedProperty.EntityConfig.Namespace}|{inheritedProperty.EntityConfig.ClassName}");
                        }
                    }
                }

                if (isNew)
                {
                    if (metadataRefresh)
                        await _dbGenerator.ProcessEntityPropertyAsync(dbProp);
                }

                itemsType = inputProp.IsItemsType ? dbProp : null;
            }
            return itemsType;
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
                    .ForMember(d => d.Name, o => o.MapFrom((dto, m) => m.CreatedInDb ? m.Name : dto.Name)) // update only if the property is not created in DB yet
                ;

                if (updateType == ModelUpdateType.DecorProperties)
                {
                    mapExpression.ForMember(d => d.DataType, o => o.Ignore());
                    mapExpression.ForMember(d => d.DataFormat, o => o.Ignore());
                    mapExpression.ForMember(d => d.ItemsType, o => o.Ignore());
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

            dto.GenerateAppService = modelConfig.GenerateAppService;
            dto.Source = modelConfig.Source;
            dto.HardcodedPropertiesMD5 = modelConfig.HardcodedPropertiesMD5;
            dto.ViewConfigurations = modelConfig.ViewConfigurations;

            var properties = await _entityPropertyRepository.GetAll()
                .Where(p => p.EntityConfig == modelConfig && p.ParentProperty == null)
                .OrderBy(p => p.SortOrder).ToListAsync();

            dto.Properties = new List<ModelPropertyDto>();

            // Check hard-coded properties only for Application classes because User defined classes are configured from the DB
            var containerType = modelConfig.Source == MetadataSourceType.ApplicationCode
                ? _typeFinder.Find(x => x.Namespace == modelConfig.Namespace && x.Name == modelConfig.ClassName).FirstOrDefault()
                : null;

            if (containerType != null)
            {
                var metadataContext = new MetadataContext(containerType);
                hardCodedProps ??= containerType.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                    .Select(p => _metadataProvider.GetPropertyMetadata(p, metadataContext))
                    .OrderBy(e => e.Path)
                    .ToList();
            }

            foreach (var dbProp in properties.OrderBy(x => x.SortOrder))
            {
                var prop = ObjectMapper.Map<ModelPropertyDto>(dbProp);
                prop.ReferenceListId = dbProp.ReferenceListName.IsNullOrEmpty()
                    ? null
                    : new ReferenceListIdentifier(dbProp.ReferenceListModule, dbProp.ReferenceListName.NotNull());

                var baseProp = dbProp;
                while (baseProp.InheritedFrom != null)
                    baseProp = baseProp.InheritedFrom;

                prop.BaseEntityType = baseProp != dbProp ? baseProp.EntityType : null;

                var hardCodedProp = hardCodedProps?.FirstOrDefault(pp => pp.Path == prop.Name);
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

                dto.Properties.Add(prop);
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
            var result = await _modelConfigsCache.GetAsync(cacheKey, async () =>
            {
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