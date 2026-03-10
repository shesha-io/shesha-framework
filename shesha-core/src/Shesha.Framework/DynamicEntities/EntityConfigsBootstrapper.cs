using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Extensions;
using Abp.Reflection;
using Castle.Core.Logging;
using Shesha.Attributes;
using Shesha.Bootstrappers;
using Shesha.Configuration.Runtime;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Domain.EntityPropertyConfiguration;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Enums;
using Shesha.DynamicEntities.ErrorHandler;
using Shesha.Extensions;
using Shesha.Metadata;
using Shesha.Metadata.Dtos;
using Shesha.Reflection;
using Shesha.Startup;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

using Module = Shesha.Domain.Module;

namespace Shesha.DynamicEntities
{
    [DependsOnTypes(typeof(ConfigurableModuleBootstrapper))]
    public class EntityConfigsBootstrapper : BootstrapperBase, ITransientDependency
    {
        private readonly IRepository<EntityConfig, Guid> _entityConfigRepository;
        private readonly IRepository<EntityProperty, Guid> _entityPropertyRepository;
        private readonly IModuleManager _moduleManager;
        private readonly IEntityTypeConfigurationStore _entityConfigurationStore;
        private readonly IAssemblyFinder _assembleFinder;
        private readonly IHardcodeMetadataProvider _metadataProvider;
        private readonly IDynamicEntitiesErrorHandler _errorHandler;

        private List<EntityConfig> _dbAllConfigs;
        private List<EntityProperty> _dbAllProperties;

        public EntityConfigsBootstrapper(
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IEntityTypeConfigurationStore entityConfigurationStore,
            IAssemblyFinder assembleFinder,
            IRepository<EntityProperty, Guid> entityPropertyRepository,
            IHardcodeMetadataProvider metadataProvider,
            IModuleManager moduleManager,
            IUnitOfWorkManager unitOfWorkManager,
            IApplicationStartupSession startupSession,
            IBootstrapperStartupService bootstrapperStartupService,
            IDynamicEntitiesErrorHandler errorHandler,
            ILogger logger
        ) : base(unitOfWorkManager, startupSession, bootstrapperStartupService, logger)
        {
            _entityConfigRepository = entityConfigRepository;
            _entityConfigurationStore = entityConfigurationStore;
            _assembleFinder = assembleFinder;
            _entityPropertyRepository = entityPropertyRepository;
            _metadataProvider = metadataProvider;
            _moduleManager = moduleManager;
            _errorHandler = errorHandler;
        }

        [UnitOfWork(IsDisabled = true)]
        protected override async Task ProcessInternalAsync()
        {
            LogInfo("Bootstrap entity configs");

            var assemblies = _assembleFinder.GetAllAssemblies()
                .Distinct(new AssemblyFullNameComparer())
                .Where(a => !a.IsDynamic
                            && a.GetTypes().Any(t => MappingHelper.IsEntity(t) || MappingHelper.IsJsonEntity(t)) // && t != typeof(JsonEntity)) need to add JsonEntity for binding purposes
                )
                .ToList();

            var all = assemblies.Count();

            var filteredAssemblies = assemblies.Where(x => !StartupSession.AssemblyStaysUnchanged(x)).ToList();
            if (!ForceUpdate)
                LogInfo($"{all - filteredAssemblies.Count()} assemblies skipped as unchanged");

            using (var unitOfWork = UnitOfWorkManager.Begin())
            {
                using (UnitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
                {
                    _dbAllConfigs = await _entityConfigRepository.GetAllListAsync();
                    _dbAllProperties = await _entityPropertyRepository.GetAllListAsync();

                    // If need to update inheritance then process all assemblies
                    var forceUpdate = ForceUpdate || _dbAllConfigs.Where(x => !x.IsDeleted && x.Source == MetadataSourceType.ApplicationCode).All(x => x.InheritedFrom == null)
                        // If need to update column names for hardcoded properties
                        || _dbAllProperties.Where(x =>
                                !x.IsDeleted
                                && x.EntityConfig.EntityConfigType == EntityConfigTypes.Class
                                && x.Source == MetadataSourceType.ApplicationCode
                            ).All(x => x.ColumnName == null)
                    ;
                    var entityTypes = (forceUpdate ? assemblies : filteredAssemblies).SelectMany(x => x.GetTypes().Where(t => MappingHelper.IsEntity(t) || MappingHelper.IsJsonEntity(t))).ToList();
                    await ProcessAsync(entityTypes);
                }
                await unitOfWork.CompleteAsync();
            }

            LogInfo("Bootstrap entity configs finished successfully");
        }

        private async Task ProcessAsync(List<Type> entityTypes)
        {
            var modules = new Dictionary<string, Module?>();

            LogInfo($"Found {entityTypes.Count()} entity types");

            var entitiesConfigs = entityTypes.Select(t =>
            {
                var config = _entityConfigurationStore.Get(t);
                var codeProperties = _metadataProvider.GetProperties(t);
                var moduleName = t.GetConfigurableModuleName();

                return new
                {
                    Config = config,
                    Properties = codeProperties,
                    PropertiesMD5 = PropertyMetadataDto.GetPropertiesMD5(codeProperties),
                    ModuleName = moduleName,
                };
            }).ToList();

            LogInfo($"Found {_dbAllConfigs.Count()} entity in the DB");

            var configEntities = _dbAllConfigs
                .Select(ec =>
                {
                    var code = entitiesConfigs.FirstOrDefault(c =>
                        c.Config.EntityType.Name.Equals(ec.ClassName, StringComparison.InvariantCultureIgnoreCase)
                        && string.Equals(c.Config.EntityType.Namespace, ec.Namespace, StringComparison.InvariantCultureIgnoreCase)
                        && c.ModuleName == ec.Module?.Name
                    );
                    return new
                    {
                        db = ec,
                        dbProperties = _dbAllProperties.Where(x => x.EntityConfig == ec && !x.IsDeleted).ToList(),
                        code,
                        attr = code?.Config.EntityType.GetAttributeOrNull<EntityAttribute>(),
                    };
                }).ToList();

            // Update out-of-date configs
            var toUpdate = ForceUpdate
                ? configEntities
                : configEntities
                .Where(
                    c =>
                        c.code != null &&
                        (
                            c.db.TableName != c.code.Config.TableName ||
                            c.db.DiscriminatorValue != c.code.Config.DiscriminatorValue ||
                            c.db.Label != c.code.Config.FriendlyName ||
                            c.db.Accessor != c.code.Config.Accessor ||
                            c.db.TypeShortAlias != c.code.Config.SafeTypeShortAlias ||
                            c.db.HardcodedPropertiesMD5 != c.code.PropertiesMD5 ||

                            c.dbProperties.Any(x => x.ColumnName == null) ||
                            c.db.InheritedFrom == null ||
                            c.attr != null
                                && c.attr.GenerateApplicationService != GenerateApplicationServiceState.UseConfiguration
                                && c.attr.GenerateApplicationService == GenerateApplicationServiceState.AlwaysGenerateApplicationService ^ c.db.GenerateAppService
                        ))
                .ToList();

            LogInfo(toUpdate.Any() ? $"Found {toUpdate.Count()} entities to update" : $"Existing entity configs are up to date");

            // Sort by inheritance
            var allUpdate = toUpdate.Count;
            var sortedToUpdate = toUpdate.Where(x => toUpdate.All(y => x.code?.Config.EntityType.BaseType?.Name != y.code?.Config.EntityType.Name)).ToList();
            var nextLevelUpdate = toUpdate.Where(x => sortedToUpdate.Any(y => x.code?.Config.EntityType.BaseType?.Name == y.code?.Config.EntityType.Name)).ToList();
            while (sortedToUpdate.Count < allUpdate && nextLevelUpdate.Count > 0)
            {
                sortedToUpdate.AddRange(nextLevelUpdate);
                nextLevelUpdate = toUpdate
                    .Where(x => !sortedToUpdate.Contains(x) && sortedToUpdate.Any(y => x.code?.Config.EntityType.BaseType?.Name == y.code?.Config.EntityType.Name))
                    .ToList();
            }

            foreach (var config in sortedToUpdate)
            {
                config.db.Label = config.code.NotNull().Config.FriendlyName;
                config.db.Accessor = config.code.Config.Accessor;
                config.db.TypeShortAlias = config.code.Config.SafeTypeShortAlias;

                var inheritedFrom = _dbAllConfigs.FirstOrDefault(x => x.FullClassName == config.code.Config.EntityType.BaseType?.FullName && !x.IsExposed);
                config.db.InheritedFrom = inheritedFrom;

                var parts = config.code.Config.TableName?.Split(".");

                config.db.SchemaName = parts?.Length == 2 ? parts[0] : null;
                config.db.TableName = parts?.Length == 1 
                    ? config.code.Config.TableName
                    : parts?.Length == 2
                        ? parts[1]
                        // use full table name for unknown format
                        : config.code.Config.TableName;
                config.db.DiscriminatorValue = config.code.Config.DiscriminatorValue;
                config.db.IsCodeBased = true;
                config.db.SurfaceStatus = RefListSurfaceStatus.Visible;

                // restore entity if deleted
                config.db.IsDeleted = false;
                config.db.DeletionTime = null;
                config.db.DeleterUserId = null;

                if (config.attr != null && config.attr.GenerateApplicationService != GenerateApplicationServiceState.UseConfiguration)
                    config.db.GenerateAppService = config.attr.GenerateApplicationService == GenerateApplicationServiceState.AlwaysGenerateApplicationService;

                var assemblyName = config.code.Config.EntityType.Assembly.FullName ?? "";
                var module = modules.ContainsKey(assemblyName)
                    ? modules[assemblyName]
                    : null;
                if (module == null && !modules.ContainsKey(assemblyName))
                {
                    module = await _moduleManager.GetOrCreateModuleAsync(config.code.Config.EntityType.Assembly);
                    modules.Add(assemblyName, module);
                }

                if (config.db.Module != module)
                    config.db.Module = module;

                await _entityConfigRepository.UpdateAsync(config.db);

                if (config.db.HardcodedPropertiesMD5 != config.code.PropertiesMD5
                    || (config.db.EntityConfigType == EntityConfigTypes.Class && config.dbProperties.Any(x => x.ColumnName == null))
                    || ForceUpdate)
                    await UpdatePropertiesAsync(config.db, config.code.Config.EntityType, config.code.Properties, config.code.PropertiesMD5);
            }

            // Add news configs
            var toAdd = entitiesConfigs.Where(c => !_dbAllConfigs.Any(ec => ec.ClassName.Equals(c.Config.EntityType.Name, StringComparison.InvariantCultureIgnoreCase) &&
                    string.Equals(ec.Namespace, c.Config.EntityType.Namespace, StringComparison.InvariantCultureIgnoreCase)
                    ))
                .ToList();

            LogInfo(toAdd.Any() ? $"Found {toAdd.Count()} entities to add" : $"New entities not found");

            // Sort by inheritance
            var allAdd = toAdd.Count;
            var sortedToAdd = toAdd.Where(x => toAdd.All(y => x.Config.EntityType.BaseType?.Name != y.Config.EntityType.Name)).ToList();
            var nextLevelAdd = toAdd.Where(x => sortedToAdd.Any(y => x.Config.EntityType.BaseType?.Name == y.Config.EntityType.Name)).ToList();
            while (sortedToAdd.Count < allAdd && nextLevelAdd.Count > 0)
            {
                sortedToAdd.AddRange(nextLevelAdd);
                nextLevelAdd = toAdd.Where(x => !sortedToAdd.Contains(x) && sortedToAdd.Any(y => x.Config.EntityType.BaseType?.Name == y.Config.EntityType.Name)).ToList();
            }

            var addedEntityConfigs = new List<EntityConfig>();
            foreach (var config in sortedToAdd)
            {
                var attr = config.Config.EntityType.GetAttributeOrNull<EntityAttribute>();

                var className = config.Config.EntityType.Name;
                var @namespace = config.Config.EntityType.Namespace;

                var inheritedFrom = _dbAllConfigs.FirstOrDefault(x => x.FullClassName == config.Config.EntityType.BaseType?.FullName && !x.IsExposed)
                    ?? addedEntityConfigs.FirstOrDefault(x => x.FullClassName == config.Config.EntityType.BaseType?.FullName);

                var assemblyName = config.Config.EntityType.Assembly.FullName ?? "";
                var module = modules.ContainsKey(assemblyName)
                    ? modules[assemblyName]
                    : null;
                if (module == null && !modules.ContainsKey(assemblyName))
                {
                    module = await _moduleManager.GetOrCreateModuleAsync(config.Config.EntityType.Assembly);
                    modules.Add(assemblyName, module);
                }

                var ec = new EntityConfig()
                {
                    IsCodeBased = true,
                    Name = className,
                    Module = module,
                    InheritedFrom = inheritedFrom,
                    ClassName = config.Config.EntityType.Name,
                    Namespace = @namespace,
                    TableName = config.Config.TableName,
                    DiscriminatorValue = config.Config.DiscriminatorValue,
                    EntityConfigType = MappingHelper.IsJsonEntity(config.Config.EntityType)
                        ? EntityConfigTypes.Interface
                        : EntityConfigTypes.Class,
                    SurfaceStatus = RefListSurfaceStatus.Visible,
                };

                ec.Accessor = config.Config.Accessor;
                ec.Source = MetadataSourceType.ApplicationCode;
                ec.Label = config.Config.FriendlyName;
                ec.Description = null;
                ec.GenerateAppService = attr == null || attr.GenerateApplicationService != GenerateApplicationServiceState.DisableGenerateApplicationService;
                ec.TypeShortAlias = config.Config.SafeTypeShortAlias;

                ec.Source = MetadataSourceType.ApplicationCode;
                ec.Description = config.Config.EntityType.GetCustomAttribute<DescriptionAttribute>()?.Description;

                ec.Suppress = false;
                ec.Normalize();

                await _entityConfigRepository.InsertAsync(ec);

                await UpdatePropertiesAsync(ec, config.Config.EntityType, config.Properties, config.PropertiesMD5);

                addedEntityConfigs.Add(ec);
            }
        }

        private void ConfigureArrayListConfiguration(EntityProperty dst, EntityPropertyListConfiguration? srcListConfiguration)
        {
            if (dst.DataType != DataTypes.Array)
                return;

            if (dst.DataFormat == ArrayFormats.EntityReference)
            {
                dst.ListConfiguration = dst.ListConfiguration ?? new EntityPropertyListConfiguration();
                dst.ListConfiguration.MappingType = EntityPropertyListConfiguration.ManyToOne;
                dst.ListConfiguration.ForeignProperty = srcListConfiguration?.ForeignProperty;
            }
            else if (dst.DataFormat == ArrayFormats.ManyToManyEntities)
            {
                dst.CreatedInDb = true;
                dst.ListConfiguration = dst.ListConfiguration ?? new EntityPropertyListConfiguration();
                dst.ListConfiguration.MappingType = EntityPropertyListConfiguration.ManyToMany;
                if (srcListConfiguration?.DbMapping != null)
                {
                    dst.ListConfiguration.DbMapping = dst.ListConfiguration.DbMapping ?? new EntityPropertyListDbMapping();
                    dst.ListConfiguration.DbMapping.ManyToManyTableName = srcListConfiguration.DbMapping?.ManyToManyTableName;
                    dst.ListConfiguration.DbMapping.ManyToManyKeyColumnName = srcListConfiguration.DbMapping?.ManyToManyKeyColumnName;
                    dst.ListConfiguration.DbMapping.ManyToManyChildColumnName = srcListConfiguration.DbMapping?.ManyToManyChildColumnName;
                    dst.ListConfiguration.DbMapping.ManyToManyInversePropertyName = srcListConfiguration.DbMapping?.ManyToManyInversePropertyName;
                }
            }
        }

        private void CopyPropertyData(EntityProperty src, EntityProperty dst)
        {

            dst.Label = src.Label;
            dst.Description = src.Description;

            dst.Name = src.Name;
            dst.Audited = src.Audited;
            dst.CascadeCreate = src.CascadeCreate;
            dst.CascadeUpdate = src.CascadeUpdate;
            dst.CascadeDeleteUnreferenced = src.CascadeDeleteUnreferenced;
            dst.DataFormat = src.DataFormat;
            dst.DataType = src.DataType;
            dst.EntityFullClassName = src.EntityFullClassName;
            dst.EntityType = src.EntityType;
            dst.EntityModule = src.EntityModule;

            dst.Max = src.Max;
            dst.MaxLength = src.MaxLength;
            dst.Min = src.Min;
            dst.MinLength = src.MinLength;

            dst.ReadOnly = src.ReadOnly;
            dst.ReferenceListModule = src.ReferenceListModule;
            dst.ReferenceListName = src.ReferenceListName;
            dst.RegExp = src.RegExp;
            dst.Required = src.Required;
            dst.Suppress = src.Suppress;
            dst.ValidationMessage = src.ValidationMessage;
            dst.IsFrameworkRelated = src.IsFrameworkRelated;

            ConfigureArrayListConfiguration(dst, src.ListConfiguration);
        }

        private async Task<EntityProperty> OverrideChildAsync(EntityProperty property, EntityProperty parentProperty)
        {
            var prop = parentProperty.Properties.FirstOrDefault(x => !x.IsDeleted && x.Name == property.Name);
            if (prop == null)
            {
                var sortOrder = parentProperty.Properties.Where(x => !x.IsDeleted).Max(x => x.SortOrder);

                prop = new EntityProperty()
                {
                    EntityConfig = parentProperty.EntityConfig,
                    Source = MetadataSourceType.UserDefined,
                    SortOrder = sortOrder++,
                    ParentProperty = parentProperty,
                    InheritedFrom = property,
                    CreatedInDb = true,
                    InitStatus = EntityInitFlags.None,
                };

                CopyPropertyData(property, prop);
            }
            else
            {
                // ToDo: AS - think about how to update inherited nested properties
                // and whether it is necessary to do so
                // (changing the structure of a JSON object may make it impossible to read old data)
            }

            await _entityPropertyRepository.InsertOrUpdateAsync(prop);

            if (property.Properties != null)
            {
                prop.Properties = (await property.Properties.SelectAsync(async x =>
                {
                    var p = await OverrideChildAsync(x, prop);
                    if (x == property.ItemsType)
                        prop.ItemsType = p;
                    return p;
                })).ToList();
            }

            if (property.ItemsType != null && prop.ItemsType == null)
            {
                prop.ItemsType = await OverrideChildAsync(property.ItemsType, prop);
            }

            return prop;
        }


        private async Task OverridePropertyAsync(EntityProperty property)
        {
            var propertyEntityConfig = property.EntityConfig;

            // Override properties only for dynamic entities or Exposed entity
            var inherited = _dbAllConfigs.Where(x =>
                !x.IsDeleted
                && (x.InheritedFrom == propertyEntityConfig && x.Source == MetadataSourceType.UserDefined
                    || x.ExposedFrom == propertyEntityConfig)
                ).ToList();

            foreach (var config in inherited)
            {
                var prop = _dbAllProperties.FirstOrDefault(x => !x.IsDeleted && x.EntityConfig == config && x.Name == property.Name && x.ParentProperty == null);
                if (prop == null)
                {
                    var sortOrder = _dbAllProperties.Where(x => !x.IsDeleted && x.EntityConfig == config).Max(x => x.SortOrder);

                    prop = new EntityProperty()
                    {
                        EntityConfig = config,
                        Source = MetadataSourceType.UserDefined,
                        SortOrder = sortOrder++,
                        ParentProperty = null,
                        InheritedFrom = property,
                        CreatedInDb = property.CreatedInDb,
                        ColumnName = property.ColumnName,
                        InitStatus = EntityInitFlags.None,
                    };

                    CopyPropertyData(property, prop);

                    await _entityPropertyRepository.InsertAsync(prop);
                }
                else
                {
                    if (prop.DataType != property.DataType)
                    {
                        prop.InitStatus = EntityInitFlags.InitializationFailed;
                        var error = $"Inheritance error from {propertyEntityConfig.FullClassName} {property.Name} ({property.DataType}): {config.FullClassName} has property ({prop.DataType})";
                        prop.InitMessage = error;
                        await _entityPropertyRepository.UpdateAsync(prop);
                        await _errorHandler.HandleInitializationErrorAsync(
                            new EntityDbInitializationException(config, new EntityPropertyDbInitializationException(prop, null, "DB bootstrapping", error), "DB bootstrapping")
                        );
                        continue;
                    }

                    CopyPropertyData(property, prop);

                    await _entityPropertyRepository.UpdateAsync(prop);
                }

                if (property.Properties != null)
                {
                    prop.Properties = (await property.Properties.SelectAsync(async x =>
                    {
                        var p = await OverrideChildAsync(x, prop);
                        if (x == property.ItemsType)
                            prop.ItemsType = p;
                        return p;
                    })).ToList();
                }

                if (property.ItemsType != null && prop.ItemsType == null)
                {
                    prop.ItemsType = await OverrideChildAsync(property.ItemsType, prop);
                }

                await OverridePropertyAsync(prop);

            }
        }

        private async Task UpdatePropertiesAsync(
            Type entityType,
            EntityConfig entityConfig,
            List<PropertyMetadataDto> codeProperties,
            List<EntityProperty> dbProperties,
            EntityProperty? parentProp = null
        )
        {
            try
            {
                var nextSortOrder = dbProperties.Any()
                    ? dbProperties.Where(p => p.ParentProperty?.Id == parentProp?.Id).Max(p => p.SortOrder) + 1
                    : 0;
                foreach (var cp in codeProperties)
                {
                    // Try to get latest created and not deleted or get latest created and deleted 
                    var dbp = dbProperties.Where(p => p.Name.Equals(cp.Path, StringComparison.InvariantCultureIgnoreCase) && p.ParentProperty?.Id == parentProp?.Id)
                        .OrderBy(p => !p.IsDeleted ? 0 : 1)
                        .ThenByDescending(p => p.CreationTime)
                        .FirstOrDefault();

                    var inheritedFrom = parentProp == null && entityConfig.InheritedFrom != null
                        ? _dbAllProperties.Where(p => 
                                p.EntityConfig == entityConfig.InheritedFrom 
                                && p.ParentProperty == null
                                && p.Name.Equals(cp.Path, StringComparison.InvariantCultureIgnoreCase)
                            )
                            .OrderBy(p => !p.IsDeleted ? 0 : 1)
                            .ThenByDescending(p => p.CreationTime)
                            .FirstOrDefault()
                        : null;

                    // Set column name only for root properties
                    var property = parentProp == null
                        ? entityType.GetProperties().FirstOrDefault(x => x.Name.ToCamelCase() == cp.Path.ToCamelCase()).NotNull($"Property {cp.Path} not found for type {entityType.FullName}")
                        : null;

                    if (dbp == null)
                    {
                        dbp = new EntityProperty
                        {
                            EntityConfig = entityConfig,
                            Source = MetadataSourceType.ApplicationCode,
                            SortOrder = nextSortOrder++,
                            ParentProperty = parentProp,
                            Label = cp.Label,
                            Description = cp.Description,
                            // Set column name only for root properties
                            ColumnName = property != null ? MappingHelper.GetColumnName(property) : null,
                            InheritedFrom = inheritedFrom,
                        };
                        MapProperty(cp, dbp);

                        await _entityPropertyRepository.InsertAsync(dbp);
                        dbProperties.Add(dbp);
                    }
                    else
                    {
                        MapProperty(cp, dbp);
                        // Update hardcoded part
                        dbp.Source = MetadataSourceType.ApplicationCode;
                        // Set column name only for root properties
                        if (property != null && dbp.ColumnName.IsNullOrEmpty())
                            dbp.ColumnName = MappingHelper.GetColumnName(property);

                        dbp.InheritedFrom = inheritedFrom;

                        // restore property
                        dbp.IsDeleted = false;
                        dbp.DeletionTime = null;
                        dbp.DeleterUserId = null;

                        await _entityPropertyRepository.UpdateAsync(dbp);
                    }

                    await UpdateItemsTypeAsync(entityType, entityConfig, dbp, cp);

                    if (cp.Properties?.Any() ?? false)
                    {
                        await UpdatePropertiesAsync(entityType, entityConfig, cp.Properties, dbp.Properties.ToList(), dbp);
                    }

                    // Check inheritace and override if needed
                    if (parentProp == null)
                        await OverridePropertyAsync(dbp);
                }

                var deletedProperties = dbProperties
                    .Where(p =>
                        p.Source == MetadataSourceType.ApplicationCode
                        && !codeProperties.Any(cp => cp.Path.Equals(p.Name, StringComparison.InvariantCultureIgnoreCase))
                        && p.ParentProperty?.Id == parentProp?.Id
                        )
                    .ToList();
                foreach (var deletedProperty in deletedProperties)
                {
                    await _entityPropertyRepository.DeleteAsync(deletedProperty);
                }
            }
            catch (Exception)
            {
                throw;
            }
        }

        private async Task UpdatePropertiesAsync(EntityConfig entityConfig, Type entityType, List<PropertyMetadataDto> codeProperties, string propertiesMD5)
        {
            try
            {
                // todo: handle inactive flag
                var dbProperties = _dbAllProperties.Where(p => p.EntityConfig == entityConfig).ToList();

                /*var duplicates = codeProperties.GroupBy(p => p.Path.ToCamelCase(), (p, items) => new { Path = p, Items = items }).Where(g => g.Items.Count() > 1).ToList();
                if (duplicates.Any())
                {
                }*/

                await UpdatePropertiesAsync(entityType, entityConfig, codeProperties, dbProperties);

                // update properties MD5 to prevent unneeded updates in future
                entityConfig.HardcodedPropertiesMD5 = propertiesMD5;

                await _entityConfigRepository.UpdateAsync(entityConfig);
            }
            catch (Exception)
            {
                throw;
            }
        }

        private async Task UpdateItemsTypeAsync(Type entityType, EntityConfig entityConfig, EntityProperty dbp, PropertyMetadataDto cp)
        {
            if (dbp.DataType == DataTypes.Array && cp.ItemsType != null)
            {
                var itemsTypeProp = dbp.ItemsType ?? new EntityProperty()
                {
                    EntityConfig = dbp.EntityConfig,
                };

                itemsTypeProp.InheritedFrom = dbp.InheritedFrom?.ItemsType;

                itemsTypeProp.EntityConfig = dbp.EntityConfig;
                // keep label and description???
                itemsTypeProp.Label = cp.ItemsType.Label;
                itemsTypeProp.Description = cp.ItemsType.Description;

                MapProperty(cp.ItemsType, itemsTypeProp);

                itemsTypeProp.Source = MetadataSourceType.ApplicationCode;
                itemsTypeProp.SortOrder = 0;
                itemsTypeProp.ParentProperty = dbp;

                // restore property
                itemsTypeProp.IsDeleted = false;
                itemsTypeProp.DeletionTime = null;
                itemsTypeProp.DeleterUserId = null;

                await _entityPropertyRepository.InsertOrUpdateAsync(itemsTypeProp);

                await UpdateItemsTypeAsync(entityType, entityConfig, itemsTypeProp, cp.ItemsType);

                if (cp.ItemsType.Properties?.Any() ?? false)
                {
                    await UpdatePropertiesAsync(entityType, entityConfig, cp.ItemsType.Properties, itemsTypeProp.Properties.ToList(), itemsTypeProp);
                }

                dbp.ItemsType = itemsTypeProp;

                await _entityPropertyRepository.UpdateAsync(dbp);
            }
            else
            {
                // delete item type if exists
                if (dbp.ItemsType != null)
                {
                    await _entityPropertyRepository.DeleteAsync(dbp.ItemsType);
                    dbp.ItemsType = null;
                    await _entityPropertyRepository.UpdateAsync(dbp);
                }
            }
        }

        private void MapProperty(PropertyMetadataDto src, EntityProperty dst)
        {
            if (dst.DataType != src.DataType)
            {
                // update some properties if dataType is changed
                dst.Suppress = !src.IsVisible;
                dst.DataFormat = src.DataFormat;
                dst.Min = src.Min;
                dst.Max = src.Max;
                dst.MinLength = src.MinLength;
                dst.MaxLength = src.MaxLength;
                dst.RegExp = src.RegExp;
                dst.ValidationMessage = src.ValidationMessage;
            }
            else
            {
                dst.Suppress = !src.IsVisible || dst.Suppress;

                // leave Data Format from DB property if exists because number format is always hardcoded
                // ToDo: AS - need to review
                dst.DataFormat = src.DataFormat;
                //dst.DataFormat = dst.DataFormat.GetDefaultIfEmpty(src.DataFormat);
                dst.Min = src.Min.GetDefaultIfEmpty(dst.Min);
                dst.Max = src.Max.GetDefaultIfEmpty(dst.Max);
                dst.MinLength = src.MinLength.GetDefaultIfEmpty(dst.MinLength);
                dst.MaxLength = src.MaxLength.GetDefaultIfEmpty(dst.MaxLength);
                dst.RegExp = src.RegExp.GetDefaultIfEmpty(dst.RegExp);

                // leave validation message from DB property if exists
                // To allow change validation message even it is hardcoded
                dst.ValidationMessage = dst.ValidationMessage.GetDefaultIfEmpty(src.ValidationMessage);
            }

            dst.Name = src.Path;
            dst.DataType = src.DataType;
            dst.EntityFullClassName = src.EntityFullClassName;
            dst.EntityType = src.EntityType;
            dst.EntityModule = src.EntityModule;
            dst.ReferenceListName = src.ReferenceListName;
            dst.ReferenceListModule = src.ReferenceListModule;
            dst.IsFrameworkRelated = src.IsFrameworkRelated;

            dst.Audited = src.Audited || dst.Audited;
            dst.Required = src.Required || dst.Required;
            dst.ReadOnly = src.Readonly || dst.ReadOnly;

            dst.CascadeCreate = src.CascadeCreate ?? dst.CascadeCreate;
            dst.CascadeUpdate = src.CascadeUpdate ?? dst.CascadeUpdate;
            dst.CascadeDeleteUnreferenced = src.CascadeDeleteUnreferenced ?? dst.CascadeDeleteUnreferenced;

            // ensure that Label is not empty even when we should skip configurable properties
            // the Entity Configurator shouldn't allow empty labels
            if (string.IsNullOrWhiteSpace(dst.Label))
            {
                dst.Label = src.Label;
            }

            ConfigureArrayListConfiguration(dst, src.ListConfiguration);
        }
    }
}