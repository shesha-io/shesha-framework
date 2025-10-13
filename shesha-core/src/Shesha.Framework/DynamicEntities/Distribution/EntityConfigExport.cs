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
    public class EntityConfigExport : ConfigurableItemExportBase<EntityConfig, DistributedEntityConfig>, IEntityConfigExport, ITransientDependency
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

        protected override async Task MapCustomPropsAsync(EntityConfig item, DistributedEntityConfig result)
        {
            var fullClassName = item.FullClassName;

            result.TypeShortAlias = item.TypeShortAlias;
            result.SchemaName = item.SchemaName;
            result.TableName = item.TableName;
            result.ClassName = item.ClassName;
            result.Namespace = item.Namespace;
            result.DiscriminatorValue = item.DiscriminatorValue;
            result.GenerateAppService = item.GenerateAppService;
            result.Source = item.Source;
            result.EntityConfigType = item.EntityConfigType;

            result.PropertiesMD5 = item.HardcodedPropertiesMD5;

            result.ViewConfigurations = MapViewConfigurations(item);
            result.Properties = await MapPropertiesAsync(item);

            result.Permission = await _permissionedObjectManager.GetOrDefaultAsync($"{fullClassName}", ShaPermissionedObjectsTypes.Entity);
            result.PermissionGet = await _permissionedObjectManager.GetOrDefaultAsync($"{fullClassName}@Get", ShaPermissionedObjectsTypes.EntityAction);
            result.PermissionCreate = await _permissionedObjectManager.GetOrDefaultAsync($"{fullClassName}@Create", ShaPermissionedObjectsTypes.EntityAction);
            result.PermissionUpdate = await _permissionedObjectManager.GetOrDefaultAsync($"{fullClassName}@Update", ShaPermissionedObjectsTypes.EntityAction);
            result.PermissionDelete = await _permissionedObjectManager.GetOrDefaultAsync($"{fullClassName}@Delete", ShaPermissionedObjectsTypes.EntityAction);
        }

        private async Task<List<DistributedEntityConfigProperty>> MapPropertiesAsync(EntityConfig entityConfig)
        {
            var dbProperties = await _entityPropertyRepo.GetAll().Where(p => p.EntityConfig == entityConfig).ToListAsync();
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
            return entityConfig.ViewConfigurations?.ToList() ?? new();
        }
    }
}