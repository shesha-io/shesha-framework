using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Services;
using Abp.Reflection;
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
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
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

        public ModelConfigurationManager(
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IRepository<EntityProperty, Guid> entityPropertyRepository,
            IPermissionedObjectManager permissionedObjectManager,
            ITypeFinder typeFinder,
            IMetadataProvider metadataProvider,
            EntityModelProvider entityModelProvider,
            IRepository<ConfigurationItem, Guid> configurationItemRepository,
            IMappingMetadataProvider mappingMetadataProvider
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
        }

        public async Task MergeConfigurationsAsync(EntityConfig source, EntityConfig destination, bool deleteAfterMerge, bool deepUpdate)
        {
            // Copy main data
            destination.Configuration.Label = source.Configuration.Label;
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
                            Name = configuration.FormId.Name,
                            Module = configuration.FormId.Module
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
                    var destProp = destPs.FirstOrDefault(x => x.Name == prop.Name);
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

                    await _entityPropertyRepository.InsertOrUpdateAsync(destProp);

                    if (prop.Properties?.Any() ?? false)
                        await copyProps(destProp.Properties.ToList(), prop.Properties.ToList(), destProp);
                }
            };

            await copyProps(destProps, sourceProps, null);
        }

        private async Task CopyPermissionsAsync(EntityConfig source, EntityConfig destination)
        {
            var copyPermission = async (string method) =>
            {
                var sourcePermission = await _permissionedObjectManager.GetOrCreateAsync($"{source.FullClassName}{method}", "entity");
                var destinationPermission = await _permissionedObjectManager.GetOrCreateAsync($"{destination.FullClassName}{method}", "entity");
                destinationPermission.Access = sourcePermission.Access;
                sourcePermission.Permissions.ToList().ForEach(x =>
                {
                    if (!destinationPermission.Permissions.Contains(x))
                        destinationPermission.Permissions.Add(x);
                });
                await _permissionedObjectManager.SetAsync(destinationPermission);
            };

            await copyPermission("");
            await copyPermission("@Get");
            await copyPermission("@Create");
            await copyPermission("@Update");
            await copyPermission("@Delete");
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
                    await _mappingMetadataProvider.UpdateClassNames(entityType, jsonProps, source.FullClassName, destination.FullClassName, true);

                if (genericProps.Any())
                    await _mappingMetadataProvider.UpdateClassNames(entityType, genericProps, source.FullClassName, destination.FullClassName, false);
            }
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

                        prop.SuppressHardcoded = !hardCodedProp.IsVisible;
                        prop.RequiredHardcoded = hardCodedProp.Required;
                        prop.ReadOnlyHardcoded = hardCodedProp.Readonly;
                        prop.AuditedHardcoded = hardCodedProp.Audited;
                        prop.SizeHardcoded = hardCodedProp.Min.HasValue
                            || hardCodedProp.Max.HasValue
                            || hardCodedProp.MinLength.HasValue
                            || hardCodedProp.MaxLength.HasValue;
                        prop.RegExpHardcoded = !string.IsNullOrWhiteSpace(hardCodedProp.RegExp);
                    }
                }
            }

            dto.Permission = await _permissionedObjectManager.GetOrCreateAsync($"{modelConfig.Namespace}.{modelConfig.ClassName}", "entity");
            dto.PermissionGet = await _permissionedObjectManager.GetOrCreateAsync($"{modelConfig.Namespace}.{modelConfig.ClassName}@Get", "entity");
            dto.PermissionCreate = await _permissionedObjectManager.GetOrCreateAsync($"{modelConfig.Namespace}.{modelConfig.ClassName}@Create", "entity");
            dto.PermissionUpdate = await _permissionedObjectManager.GetOrCreateAsync($"{modelConfig.Namespace}.{modelConfig.ClassName}@Update", "entity");
            dto.PermissionDelete = await _permissionedObjectManager.GetOrCreateAsync($"{modelConfig.Namespace}.{modelConfig.ClassName}@Delete", "entity");

            dto.NormalizeViewConfigurations(modelConfig);

            return dto;
        }

        public async Task<ModelConfigurationDto> GetModelConfigurationOrNullAsync(string @namespace, string name, List<PropertyMetadataDto> hardCodedProps = null)
        {
            var modelConfig = await _entityConfigRepository.GetAll().Where(m => m.ClassName == name && m.Namespace == @namespace && !m.Configuration.IsDeleted).FirstOrDefaultAsync();
            if (modelConfig == null)
                return null;

            return await GetModelConfigurationAsync(modelConfig, hardCodedProps);
        }

        public async Task<ModelConfigurationDto> GetModelConfigurationOrNullAsync(Guid id, List<PropertyMetadataDto> hardCodedProps = null)
        {
            var modelConfig = await _entityConfigRepository.GetAll().Where(m => m.Id == id).FirstOrDefaultAsync();
            if (modelConfig == null)
                return null;

            return await GetModelConfigurationAsync(modelConfig, hardCodedProps);
        }
    }
}
