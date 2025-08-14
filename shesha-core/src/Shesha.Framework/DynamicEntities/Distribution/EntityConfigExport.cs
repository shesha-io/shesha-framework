using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.DynamicEntities.Distribution.Dto;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using Shesha.Permissions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Distribution
{
    /// inheritedDoc
    public class EntityConfigExport : ConfigurableItemExportBase<EntityConfig, EntityConfigRevision, DistributedEntityConfig>, IEntityConfigExport, ITransientDependency
    {
        private readonly IRepository<EntityProperty, Guid> _entityPropertyRepo;
        private readonly IPermissionedObjectManager _permissionedObjectManager;

        public string ItemType => EntityConfig.ItemTypeName;

        public EntityConfigExport(
            IRepository<EntityProperty, Guid> entityPropertyRepo,
            IPermissionedObjectManager permissionedObjectManager
        )
        {
            _entityPropertyRepo = entityPropertyRepo;
            _permissionedObjectManager = permissionedObjectManager;
        }

        /// inheritedDoc
        public override async Task<DistributedEntityConfig> ExportAsync(EntityConfig entityConfig)
        {
            var readRevision = entityConfig.LatestRevision;
            var fullClassName = readRevision.FullClassName;

            var result = new DistributedEntityConfig
            {
                Id = entityConfig.Id,
                Name = entityConfig.Name,
                ModuleName = entityConfig.Module?.Name,
                FrontEndApplication = entityConfig.Application?.AppKey,
                ItemType = entityConfig.ItemType,

                Label = readRevision.Label,
                Description = readRevision.Description,
                OriginId = entityConfig.Origin?.Id,
                Suppress = entityConfig.Suppress,

                // entity config specific properties
                TypeShortAlias = readRevision.TypeShortAlias,
                TableName = readRevision.TableName,
                ClassName = readRevision.ClassName,
                Namespace = readRevision.Namespace,
                DiscriminatorValue = readRevision.DiscriminatorValue,
                GenerateAppService = readRevision.GenerateAppService,
                Source = readRevision.Source,
                EntityConfigType = readRevision.EntityConfigType,

                FriendlyName = readRevision.FriendlyName,
                PropertiesMD5 = readRevision.HardcodedPropertiesMD5,

                ViewConfigurations = MapViewConfigurations(entityConfig),
                Properties = await MapPropertiesAsync(entityConfig),

                Permission = await _permissionedObjectManager.GetOrDefaultAsync($"{fullClassName}", ShaPermissionedObjectsTypes.Entity),
                PermissionGet = await _permissionedObjectManager.GetOrDefaultAsync($"{fullClassName}@Get", ShaPermissionedObjectsTypes.EntityAction),
                PermissionCreate = await _permissionedObjectManager.GetOrDefaultAsync($"{fullClassName}@Create", ShaPermissionedObjectsTypes.EntityAction),
                PermissionUpdate = await _permissionedObjectManager.GetOrDefaultAsync($"{fullClassName}@Update", ShaPermissionedObjectsTypes.EntityAction),
                PermissionDelete = await _permissionedObjectManager.GetOrDefaultAsync($"{fullClassName}@Delete", ShaPermissionedObjectsTypes.EntityAction),
            };

            return result;
        }
        
        private async Task<List<DistributedEntityConfigProperty>> MapPropertiesAsync(EntityConfig entityConfig)
        {
            var dbProperties = await _entityPropertyRepo.GetAll().Where(p => p.EntityConfigRevision == entityConfig.Revision).ToListAsync();
            var properties = new List<DistributedEntityConfigProperty>();
            foreach (var dbProp in dbProperties)
            {
                properties.Add(await MapPropertyAsync(dbProp));
            }
            return properties;
        }

        private async Task<DistributedEntityConfigProperty> MapPropertyAsync(EntityProperty src) 
        {
            var property = new DistributedEntityConfigProperty();
            property.Name = src.Name;
            property.Label = src.Label;
            property.Description = src.Description;
            property.DataType = src.DataType;
            property.DataFormat = src.DataFormat;
            property.EntityType = src.EntityType;
            property.ReferenceListName = src.ReferenceListName;
            property.ReferenceListModule = src.ReferenceListModule;
            property.Source = src.Source;
            property.SortOrder = src.SortOrder;

            property.ItemsType = src.ItemsType != null 
                ? await MapPropertyAsync(src.ItemsType)
                : null;
            property.IsFrameworkRelated = src.IsFrameworkRelated;
            property.Suppress = src.Suppress;
            property.Required = src.Required;
            property.ReadOnly = src.ReadOnly;
            property.Audited = src.Audited;
            property.Min = src.Min;
            property.Max = src.Max;
            property.MinLength = src.MinLength;
            property.MaxLength = src.MaxLength;
            property.RegExp = src.RegExp;
            property.ValidationMessage = src.ValidationMessage;

            property.CascadeCreate = src.CascadeCreate;
            property.CascadeUpdate = src.CascadeUpdate;
            property.CascadeDeleteUnreferenced = src.CascadeDeleteUnreferenced;

            foreach (var childProp in src.Properties) 
            {
                property.Properties.Add(await MapPropertyAsync(childProp));
            }

            return property;
        }

        private List<EntityViewConfigurationDto> MapViewConfigurations(EntityConfig entityConfig)
        {
            return entityConfig.LatestRevision.ViewConfigurations?.ToList() ?? new();
        }
    }
}