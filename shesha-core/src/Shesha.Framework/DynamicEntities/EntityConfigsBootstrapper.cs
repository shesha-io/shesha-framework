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
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;
using Shesha.Extensions;
using Shesha.JsonEntities;
using Shesha.Metadata;
using Shesha.Metadata.Dtos;
using Shesha.Reflection;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    [DependsOnBootstrapper(typeof(ConfigurableModuleBootstrapper))]
    public class EntityConfigsBootstrapper : IBootstrapper, ITransientDependency
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IRepository<EntityConfig, Guid> _entityConfigRepository;
        private readonly IRepository<EntityProperty, Guid> _entityPropertyRepository;
        private readonly IModuleManager _moduleManager;
        // todo: remove usage of IEntityConfigurationStore
        private readonly IEntityConfigurationStore _entityConfigurationStore;
        private readonly IAssemblyFinder _assembleFinder;
        private readonly IMetadataProvider _metadataProvider;

        public ILogger Logger { get; set; } = NullLogger.Instance;

        public EntityConfigsBootstrapper(
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IEntityConfigurationStore entityConfigurationStore,
            IAssemblyFinder assembleFinder,
            IRepository<EntityProperty, Guid> entityPropertyRepository,
            IMetadataProvider metadataProvider,
            IModuleManager moduleManager,
            IUnitOfWorkManager unitOfWorkManager)
        {
            _entityConfigRepository = entityConfigRepository;
            _entityConfigurationStore = entityConfigurationStore;
            _assembleFinder = assembleFinder;
            _entityPropertyRepository = entityPropertyRepository;
            _metadataProvider = metadataProvider;
            _moduleManager = moduleManager;
            _unitOfWorkManager = unitOfWorkManager;
        }

        [UnitOfWork(IsDisabled = true)]
        public async Task ProcessAsync()
        {
            Logger.Warn("Bootstrap entity configs");

            var assemblies = _assembleFinder.GetAllAssemblies()
                .Distinct(new AssemblyFullNameComparer())
                .Where(a => !a.IsDynamic &&
                            a.GetTypes().Any(t => MappingHelper.IsEntity(t) || MappingHelper.IsJsonEntity(t) && t != typeof(JsonEntity))
                )
                .ToList();
            Logger.Warn($"Found {assemblies.Count()} assemblies to bootstrap");

            foreach (var assembly in assemblies)
            {
                Logger.Warn($"Bootstrap assembly {assembly.FullName}");

                using (var unitOfWork = _unitOfWorkManager.Begin())
                {
                    using (_unitOfWorkManager.Current.DisableFilter(AbpDataFilters.SoftDelete))
                    {
                        await ProcessAssemblyAsync(assembly);
                    }
                    await unitOfWork.CompleteAsync();
                }
                Logger.Warn($"Bootstrap assembly {assembly.FullName} - finished");
            }
            Logger.Warn("Bootstrap entity configs finished successfully");
            // update inheritance
            /*foreach (var assembly in assemblies)
            {
                await ProcessInheritanceAsync(assembly);
            }*/
        }

        private async Task ProcessInheritanceAsync(Assembly assembly)
        {
            var entityTypes = assembly.GetTypes().Where(t => MappingHelper.IsEntity(t)).ToList();

            foreach (var entityType in entityTypes)
            {
                var name = entityType.Name;
                var parent = entityType;
                EntityConfig dbParent = null;
                while (parent != typeof(object) && dbParent == null)
                {
                    parent = parent.BaseType;
                    dbParent = await _entityConfigRepository.GetAll().Where(x => x.Namespace == parent.Namespace && x.ClassName == parent.Name).FirstOrDefaultAsync();
                }
                if (dbParent != null)
                {
                    var dbEntity = await _entityConfigRepository.GetAll().Where(x => x.Namespace == entityType.Namespace && x.ClassName == entityType.Name).FirstOrDefaultAsync();
                    dbEntity.Parent = dbParent;
                    await _entityConfigRepository.UpdateAsync(dbEntity);
                }
            }
        }

        private async Task ProcessAssemblyAsync(Assembly assembly)
        {
            var module = await _moduleManager.GetOrCreateModuleAsync(assembly);

            var entityTypes = assembly.GetTypes().Where(t => MappingHelper.IsEntity(t) || MappingHelper.IsJsonEntity(t) && t != typeof(JsonEntity))
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
                    PropertiesMD5 = GetPropertiesMD5(codeProperties),
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
                            code = entitiesConfigs.FirstOrDefault(c => c.Config.EntityType.Name.Equals(ec.ClassName, StringComparison.InvariantCultureIgnoreCase) &&
                                    c.Config.EntityType.Namespace.Equals(ec.Namespace, StringComparison.InvariantCultureIgnoreCase)
                                )
                        })
                .Select(
                    ec =>
                        new
                        {
                            db = ec.db,
                            code = ec.code,
                            attr = ec.code?.Config.EntityType.GetAttribute<EntityAttribute>()
                        }
                ).ToList();

            // Update out-of-date configs
            var toUpdate = configEntities
                .Where(
                    c =>
                        c.code != null &&
                        (c.db.FriendlyName != c.code.Config.FriendlyName ||
                        c.db.TableName != c.code.Config.TableName ||
                        c.db.TypeShortAlias != c.code.Config.SafeTypeShortAlias ||
                        c.db.DiscriminatorValue != c.code.Config.DiscriminatorValue ||
                        c.db.PropertiesMD5 != c.code.PropertiesMD5 ||
                        c.db.Module != module ||
                        c.attr != null
                            && c.attr.GenerateApplicationService != GenerateApplicationServiceState.UseConfiguration
                            && c.attr.GenerateApplicationService == GenerateApplicationServiceState.AlwaysGenerateApplicationService ^ c.db.GenerateAppService
                        ))
                .ToList();

            Logger.Info(toUpdate.Any()
                ? $"{assembly.FullName}: found {toUpdate.Count()} entities to update"
                : "{assembly.FullName}: existing entity configs are up to date");

            foreach (var config in toUpdate)
            {
                config.db.FriendlyName = config.code.Config.FriendlyName;
                config.db.TableName = config.code.Config.TableName;
                config.db.TypeShortAlias = config.code.Config.SafeTypeShortAlias;
                config.db.DiscriminatorValue = config.code.Config.DiscriminatorValue;

                if (config.attr != null && config.attr.GenerateApplicationService != GenerateApplicationServiceState.UseConfiguration)
                    config.db.GenerateAppService = config.attr.GenerateApplicationService == GenerateApplicationServiceState.AlwaysGenerateApplicationService;

                if (config.db.Module != module)
                    config.db.Module = module;

                await _entityConfigRepository.UpdateAsync(config.db);

                if (config.db.PropertiesMD5 != config.code.PropertiesMD5)
                    await UpdatePropertiesAsync(config.db, config.code.Config.EntityType, config.code.Properties, config.code.PropertiesMD5);

            }

            // Add news configs
            var toAdd = entitiesConfigs.Where(c => !dbEntities.Any(ec => ec.ClassName.Equals(c.Config.EntityType.Name, StringComparison.InvariantCultureIgnoreCase) &&
                    ec.Namespace.Equals(c.Config.EntityType.Namespace, StringComparison.InvariantCultureIgnoreCase)))
                .ToList();
            Logger.Info(toUpdate.Any()
                ? $"{assembly.FullName}: found {toUpdate.Count()} entities to add"
                : "{assembly.FullName}: new entities not found");

            foreach (var config in toAdd)
            {
                var attr = config.Config.EntityType.GetAttribute<EntityAttribute>();
                var ec = new EntityConfig()
                {
                    FriendlyName = config.Config.FriendlyName,
                    TableName = config.Config.TableName,
                    TypeShortAlias = config.Config.SafeTypeShortAlias,
                    DiscriminatorValue = config.Config.DiscriminatorValue,
                    ClassName = config.Config.EntityType.Name,
                    Namespace = config.Config.EntityType.Namespace,

                    GenerateAppService = attr == null || attr.GenerateApplicationService != GenerateApplicationServiceState.DisableGenerateApplicationService,

                    EntityConfigType = MappingHelper.IsJsonEntity(config.Config.EntityType)
                        ? EntityConfigTypes.Interface
                        : EntityConfigTypes.Class,

                    Source = Domain.Enums.MetadataSourceType.ApplicationCode
                };

                // ToDo: AS - Get Module, Description and Suppress
                ec.Module = module;
                ec.Name = ec.FullClassName;
                ec.Label = ec.FriendlyName ?? ec.ClassName;
                ec.Description = null;
                ec.Suppress = false;

                // ToDo: Temporary
                ec.VersionNo = 1;
                ec.VersionStatus = ConfigurationItemVersionStatus.Live;

                ec.Normalize();

                await _entityConfigRepository.InsertAsync(ec);

                await UpdatePropertiesAsync(ec, config.Config.EntityType, config.Properties, config.PropertiesMD5);
            }
        }

        private string GetPropertiesMD5(List<PropertyMetadataDto> dtos)
        {
            var propertyProps = typeof(PropertyMetadataDto).GetProperties().OrderBy(p => p.Name).ToList();

            Action<List<PropertyMetadataDto>, List<PropertyMetadataDto>> expr = null;
            expr = (List<PropertyMetadataDto> l, List<PropertyMetadataDto> props) =>
            {
                foreach (var prop in props)
                {
                    l.Add(prop);
                    if (prop.Properties?.Any() ?? false)
                    {
                        expr(l, prop.Properties);
                    }
                }
            };

            var newDtos = new List<PropertyMetadataDto>();
            expr(newDtos, dtos);

            var ordered = newDtos.OrderBy(p => p.Path).ToList();

            var sb = new StringBuilder();
            foreach (var dto in ordered)
            {
                foreach (var prop in propertyProps)
                {
                    var propValue = prop.GetValue(dto)?.ToString();
                    sb.Append(propValue);
                    sb.Append(";");
                }
                sb.AppendLine();
            }
            return sb.ToString().ToMd5Fingerprint();
        }

        private async Task UpdatePropertiesAsync(
            EntityConfig entityConfig, List<PropertyMetadataDto> codeProperties, List<EntityProperty> dbProperties, EntityProperty parentProp = null)
        {
            try
            {
                var nextSortOrder = dbProperties.Any()
                    ? dbProperties.Where(p => p.ParentProperty?.Id == parentProp?.Id).Max(p => p.SortOrder) + 1
                    : 0;
                foreach (var cp in codeProperties)
                {
                    var dbp = dbProperties.FirstOrDefault(p => p.Name == cp.Path && p.ParentProperty?.Id == parentProp?.Id);
                    if (dbp == null)
                    {
                        dbp = new EntityProperty
                        {
                            EntityConfig = entityConfig,
                            Source = Domain.Enums.MetadataSourceType.ApplicationCode,
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
                        dbp.Source = Domain.Enums.MetadataSourceType.ApplicationCode;
                            
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

                    // todo: how to update properties? merge issue
                    //dbp.Label = cp.Label;
                    //dbp.Description = cp.Description;
                }

                // todo: inactivate missing properties
                var deletedProperties = dbProperties
                    .Where(p =>
                        p.Source == Domain.Enums.MetadataSourceType.ApplicationCode
                        && !codeProperties.Any(cp => cp.Path == p.Name)
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
                var dbProperties = await _entityPropertyRepository.GetAll().Where(p => p.EntityConfig == entityConfig).ToListAsync();

                var duplicates = codeProperties.GroupBy(p => p.Path, (p, items) => new { Path = p, Items = items }).Where(g => g.Items.Count() > 1).ToList();
                if (duplicates.Any())
                {
                }

                await UpdatePropertiesAsync(entityConfig, codeProperties, dbProperties);

                // update properties MD5 to prevent unneeded updates in future
                entityConfig.PropertiesMD5 = propertiesMD5;
                await _entityConfigRepository.UpdateAsync(entityConfig);
            }
            catch (Exception)
            {
                throw;
            }
        }

        private async Task UpdateItemsTypeAsync(EntityProperty dbp, PropertyMetadataDto cp)
        {
            var shouldHaveItemsType = dbp.DataType == DataTypes.Array && cp.ItemsType != null;

            if (!shouldHaveItemsType)
            {
                // delete item type if exists
                if (dbp.ItemsType != null)
                {
                    await _entityPropertyRepository.DeleteAsync(dbp.ItemsType);
                    dbp.ItemsType = null;
                    await _entityPropertyRepository.UpdateAsync(dbp);
                }
            }
            else
            {
                if (dbp.ItemsType == null)
                    dbp.ItemsType = new EntityProperty();

                dbp.ItemsType.EntityConfig = dbp.EntityConfig;
                cp.ItemsType.Label = dbp.ItemsType.Label;
                cp.ItemsType.Description = dbp.ItemsType.Description;

                MapProperty(cp.ItemsType, dbp.ItemsType);

                dbp.ItemsType.Source = Domain.Enums.MetadataSourceType.ApplicationCode;
                dbp.ItemsType.SortOrder = 0;
                await _entityPropertyRepository.UpdateAsync(dbp);
            }
        }

        private void MapProperty(PropertyMetadataDto src, EntityProperty dst)
        {
            dst.Name = src.Path;
            dst.DataType = src.DataType;
            dst.EntityType = src.EntityTypeShortAlias;
            dst.ReferenceListName = src.ReferenceListName;
            dst.ReferenceListModule = src.ReferenceListModule;
            dst.IsFrameworkRelated = src.IsFrameworkRelated;

            dst.DataFormat = src.DataFormat.GetDefaultIfEmpty(dst.DataFormat);
            dst.Min = src.Min.GetDefaultIfEmpty(dst.Min);
            dst.Max = src.Max.GetDefaultIfEmpty(dst.Max);
            dst.MinLength = src.MinLength.GetDefaultIfEmpty(dst.MinLength);
            dst.MaxLength = src.MaxLength.GetDefaultIfEmpty(dst.MaxLength);
            dst.Suppress = !src.IsVisible || dst.Suppress;
            dst.Audited = src.Audited || dst.Audited;
            dst.Required = src.Required || dst.Required;
            dst.ReadOnly = src.Readonly || dst.ReadOnly;
            dst.RegExp = src.RegExp.GetDefaultIfEmpty(dst.RegExp);

            // get validation message from hardcoded property if empty
            // To allow change validation message even it is hardcoded
            dst.ValidationMessage = dst.ValidationMessage.GetDefaultIfEmpty(src.ValidationMessage);
            
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
