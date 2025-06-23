using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Reflection;
using Castle.Core.Logging;
using Shesha.Bootstrappers;
using Shesha.Configuration.Runtime;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using Shesha.Extensions;
using Shesha.Metadata;
using Shesha.Metadata.Dtos;
using Shesha.Reflection;
using Shesha.Startup;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    [DependsOnBootstrapper(typeof(ConfigurableModuleBootstrapper))]
    public class EntityConfigsBootstrapper : IBootstrapper, ITransientDependency
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<EntityConfig, Guid> _entityConfigRepository;
        private readonly IRepository<EntityConfigRevision, Guid> _entityConfigRevisionRepository;
        private readonly IRepository<EntityProperty, Guid> _entityPropertyRepository;
        private readonly IModuleManager _moduleManager;
        // todo: remove usage of IEntityConfigurationStore
        private readonly IEntityConfigurationStore _entityConfigurationStore;
        private readonly IAssemblyFinder _assembleFinder;
        private readonly IHardcodeMetadataProvider _metadataProvider;
        private readonly IApplicationStartupSession _startupSession;

        public ILogger Logger { get; set; } = NullLogger.Instance;

        public EntityConfigsBootstrapper(
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IRepository<EntityConfigRevision, Guid> entityConfigRevisionRepository,
            IEntityConfigurationStore entityConfigurationStore,
            IAssemblyFinder assembleFinder,
            IRepository<EntityProperty, Guid> entityPropertyRepository,
            IHardcodeMetadataProvider metadataProvider,
            IModuleManager moduleManager,
            IUnitOfWorkManager unitOfWorkManager,
            IApplicationStartupSession startupSession)
        {
            _entityConfigRepository = entityConfigRepository;
            _entityConfigRevisionRepository = entityConfigRevisionRepository;
            _entityConfigurationStore = entityConfigurationStore;
            _assembleFinder = assembleFinder;
            _entityPropertyRepository = entityPropertyRepository;
            _metadataProvider = metadataProvider;
            _moduleManager = moduleManager;
            _unitOfWorkManager = unitOfWorkManager;
            _startupSession = startupSession;
        }

        [UnitOfWork(IsDisabled = true)]
        public async Task ProcessAsync(bool force)
        {
            Logger.Warn("Bootstrap entity configs");

            var assemblies = _assembleFinder.GetAllAssemblies()
                .Distinct(new AssemblyFullNameComparer())
                .Where(a => !a.IsDynamic
                            && a.GetTypes().Any(t => MappingHelper.IsEntity(t) || MappingHelper.IsJsonEntity(t)) // && t != typeof(JsonEntity)) need to add JsonEntity for binding purposes
                )
                .ToList();

            var all = assemblies.Count();
            Logger.Warn($"Found {all} assemblies to bootstrap");
            if (!force) 
            {
                assemblies = assemblies.Where(x => !_startupSession.AssemblyStaysUnchanged(x)).ToList();
                Logger.Warn($"{all - assemblies.Count()} assemblies skipped as unchanged");
            }                

            foreach (var assembly in assemblies)
            {
                Logger.Warn($"Bootstrap assembly {assembly.FullName}");

                using (var unitOfWork = _unitOfWorkManager.Begin())
                {
                    using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
                    {
                        await ProcessAssemblyAsync(assembly, force);
                    }
                    await unitOfWork.CompleteAsync();
                }
                Logger.Warn($"Bootstrap assembly {assembly.FullName} - finished");
            }
            Logger.Warn("Bootstrap entity configs finished successfully");
        }

        private async Task ProcessAssemblyAsync(Assembly assembly, bool force)
        {
            var module = await _moduleManager.GetOrCreateModuleAsync(assembly);

            var entityTypes = assembly.GetTypes().Where(t => MappingHelper.IsEntity(t) || MappingHelper.IsJsonEntity(t))
                .ToList();

            Logger.Info($"{assembly.FullName}: found {entityTypes.Count()} entity types");

            // todo: remove usage of IEntityConfigurationStore
            var entitiesConfigs = entityTypes.Select(t =>
            {
                var config = _entityConfigurationStore.Get(t);
                var codeProperties = _metadataProvider.GetProperties(t);

                return new
                {
                    Config = config,
                    Properties = codeProperties,
                    PropertiesMD5 = PropertyMetadataDto.GetPropertiesMD5(codeProperties),
                };
            }).ToList();

            var dbEntities = await _entityConfigRepository.GetAll().ToListAsync();

            Logger.Info($"{assembly.FullName}: found {dbEntities.Count()} entity in the DB");

            var configEntities = dbEntities
                .Select(
                    ec =>
                        new
                        {
                            db = ec,
                            code = entitiesConfigs.FirstOrDefault(c => c.Config.EntityType.Name.Equals(ec.LatestRevision.ClassName, StringComparison.InvariantCultureIgnoreCase) &&
                                string.Equals(c.Config.EntityType.Namespace, ec.LatestRevision.Namespace, StringComparison.InvariantCultureIgnoreCase)
                            )
                        })
                .Select(
                    ec =>
                        new
                        {
                            db = ec.db,
                            code = ec.code,
                            attr = ec.code?.Config.EntityType.GetAttributeOrNull<EntityAttribute>()
                        }
                ).ToList();

            // Update out-of-date configs
            var toUpdate = configEntities
                .Where(
                    c =>
                        c.code != null &&
                        (force ||
                            (c.db.LatestRevision.FriendlyName != c.code.Config.FriendlyName ||
                            c.db.LatestRevision.TableName != c.code.Config.TableName ||
                            c.db.LatestRevision.Accessor != c.code.Config.Accessor ||
                            c.db.LatestRevision.TypeShortAlias != c.code.Config.SafeTypeShortAlias ||
                            c.db.LatestRevision.DiscriminatorValue != c.code.Config.DiscriminatorValue ||
                            c.db.LatestRevision.HardcodedPropertiesMD5 != c.code.PropertiesMD5 ||
                            c.db.Module != module ||
                            c.attr != null
                                && c.attr.GenerateApplicationService != GenerateApplicationServiceState.UseConfiguration
                                && c.attr.GenerateApplicationService == GenerateApplicationServiceState.AlwaysGenerateApplicationService ^ c.db.LatestRevision.GenerateAppService
                            )
                        ))
                .ToList();

            Logger.Info(toUpdate.Any()
                ? $"{assembly.FullName}: found {toUpdate.Count()} entities to update"
                : "{assembly.FullName}: existing entity configs are up to date");

            var names = toUpdate.Select(x => x.db.Name).ToList();
            
            foreach (var config in toUpdate)
            {
                var revision = config.db.EnsureLatestRevision();
                revision.FriendlyName = config.code.NotNull().Config.FriendlyName;
                revision.Accessor = config.code.Config.Accessor;
                revision.TableName = config.code.Config.TableName;
                revision.TypeShortAlias = config.code.Config.SafeTypeShortAlias;
                config.db.LatestRevision.DiscriminatorValue = config.code.Config.DiscriminatorValue;
                
                // restore entity if deleted
                config.db.IsDeleted = false;
                config.db.DeletionTime = null;
                config.db.DeleterUserId = null;


                if (config.attr != null && config.attr.GenerateApplicationService != GenerateApplicationServiceState.UseConfiguration)
                    revision.GenerateAppService = config.attr.GenerateApplicationService == GenerateApplicationServiceState.AlwaysGenerateApplicationService;

                if (config.db.Module != module)
                    config.db.Module = module;

                await _entityConfigRepository.UpdateAsync(config.db);

                if (config.db.LatestRevision.HardcodedPropertiesMD5 != config.code.PropertiesMD5)
                    await UpdatePropertiesAsync(config.db, config.code.Config.EntityType, config.code.Properties, config.code.PropertiesMD5);

            }

            // Add news configs
            var toAdd = entitiesConfigs.Where(c => !dbEntities.Any(ec => ec.LatestRevision.ClassName.Equals(c.Config.EntityType.Name, StringComparison.InvariantCultureIgnoreCase) &&
                    string.Equals(ec.LatestRevision.Namespace, c.Config.EntityType.Namespace, StringComparison.InvariantCultureIgnoreCase)
                    ))
                .ToList();
            Logger.Info(toUpdate.Any()
                ? $"{assembly.FullName}: found {toUpdate.Count()} entities to add"
                : "{assembly.FullName}: new entities not found");

            foreach (var config in toAdd)
            {
                var attr = config.Config.EntityType.GetAttributeOrNull<EntityAttribute>();

                var className = config.Config.EntityType.Name;
                var @namespace = config.Config.EntityType.Namespace;

                var ec = new EntityConfig()
                {
                    Module = module,
                    Name = $"{@namespace}.{className}"
                };

                var revision = ec.EnsureLatestRevision();
                revision.Accessor = config.Config.Accessor;
                revision.EntityConfigType = MappingHelper.IsJsonEntity(config.Config.EntityType)
                        ? EntityConfigTypes.Interface
                        : EntityConfigTypes.Class;
                revision.Source = MetadataSourceType.ApplicationCode;
                revision.ClassName = config.Config.EntityType.Name;
                revision.Namespace = @namespace;
                revision.FriendlyName = config.Config.FriendlyName;
                revision.Label = revision.FriendlyName ?? className;
                revision.Description = null;
                revision.GenerateAppService = attr == null || attr.GenerateApplicationService != GenerateApplicationServiceState.DisableGenerateApplicationService;
                revision.TypeShortAlias = config.Config.SafeTypeShortAlias;
                revision.TableName = config.Config.TableName;
                revision.DiscriminatorValue = config.Config.DiscriminatorValue;

                ec.Suppress = false;
                ec.Normalize();

                await _entityConfigRevisionRepository.InsertAsync(revision);
                await _entityConfigRepository.InsertAsync(ec);

                await UpdatePropertiesAsync(ec, config.Config.EntityType, config.Properties, config.PropertiesMD5);
            }
        }

        private async Task UpdatePropertiesAsync(
            EntityConfig entityConfig, List<PropertyMetadataDto> codeProperties, List<EntityProperty> dbProperties, EntityProperty? parentProp = null)
        {
            try
            {
                var nextSortOrder = dbProperties.Any()
                    ? dbProperties.Where(p => p.ParentProperty?.Id == parentProp?.Id).Max(p => p.SortOrder) + 1
                    : 0;
                foreach (var cp in codeProperties)
                {
                    var dbp = dbProperties.Where(p => p.Name.Equals(cp.Path, StringComparison.InvariantCultureIgnoreCase) && p.ParentProperty?.Id == parentProp?.Id)
                        .OrderBy(p => !p.IsDeleted ? 0 : 1)
                        .ThenByDescending(p => p.CreationTime)
                        .FirstOrDefault();
                    if (dbp == null)
                    {
                        dbp = new EntityProperty
                        {
                            EntityConfigRevision = entityConfig.EnsureLatestRevision(),
                            Source = MetadataSourceType.ApplicationCode,
                            SortOrder = nextSortOrder++,
                            ParentProperty = parentProp,
                            Label = cp.Label,
                            Description = cp.Description,
                        };
                        MapProperty(cp, dbp);

                        await _entityPropertyRepository.InsertAsync(dbp);
                    }
                    else
                    {
                        MapProperty(cp, dbp);
                        // update hardcoded part
                        dbp.Source = MetadataSourceType.ApplicationCode;

                        // restore property
                        dbp.IsDeleted = false;
                        dbp.DeletionTime = null;
                        dbp.DeleterUserId = null;

                        await _entityPropertyRepository.UpdateAsync(dbp);
                    }

                    await UpdateItemsTypeAsync(dbp, cp);

                    if (cp.Properties?.Any() ?? false)
                    {
                        await UpdatePropertiesAsync(entityConfig, cp.Properties, dbProperties, dbp);
                    }
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
                var revision = entityConfig.EnsureLatestRevision();

                // todo: handle inactive flag
                var dbProperties = await _entityPropertyRepository.GetAll().Where(p => p.EntityConfigRevision == revision).ToListAsync();

                var duplicates = codeProperties.GroupBy(p => p.Path.ToCamelCase(), (p, items) => new { Path = p, Items = items }).Where(g => g.Items.Count() > 1).ToList();
                if (duplicates.Any())
                {
                }

                await UpdatePropertiesAsync(entityConfig, codeProperties, dbProperties);

                // update properties MD5 to prevent unneeded updates in future
                revision.HardcodedPropertiesMD5 = propertiesMD5;

                await _entityConfigRepository.UpdateAsync(entityConfig);
            }
            catch (Exception)
            {
                throw;
            }
        }

        private async Task UpdateItemsTypeAsync(EntityProperty dbp, PropertyMetadataDto cp)
        {
            if (dbp.DataType == DataTypes.Array && cp.ItemsType != null)
            {
                var itemsTypeProp = dbp.ItemsType ?? (dbp.ItemsType = new EntityProperty() { 
                    EntityConfigRevision = dbp.EntityConfigRevision,
                });

                itemsTypeProp.EntityConfigRevision = dbp.EntityConfigRevision;
                // keep label and description???
                cp.ItemsType.Label = itemsTypeProp.Label;
                cp.ItemsType.Description = itemsTypeProp.Description;

                MapProperty(cp.ItemsType, itemsTypeProp);

                itemsTypeProp.Source = MetadataSourceType.ApplicationCode;
                itemsTypeProp.SortOrder = 0;
                itemsTypeProp.ParentProperty = dbp;

                // restore property
                itemsTypeProp.IsDeleted = false;
                itemsTypeProp.DeletionTime = null;
                itemsTypeProp.DeleterUserId = null;

                await _entityPropertyRepository.InsertOrUpdateAsync(itemsTypeProp);

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
                dst.DataFormat = dst.DataFormat.GetDefaultIfEmpty(src.DataFormat);
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
            dst.EntityType = src.EntityType;
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
        }
    }
}