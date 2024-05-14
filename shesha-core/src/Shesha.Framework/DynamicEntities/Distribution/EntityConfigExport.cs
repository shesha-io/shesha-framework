using Abp.Dependency;
using Abp.Domain.Repositories;
using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.DynamicEntities.Distribution.Dto;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using Shesha.Permissions;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Distribution
{
    /// inheritedDoc
    public class EntityConfigExport : IEntityConfigExport, ITransientDependency
    {
        private readonly IRepository<EntityConfig, Guid> _entityConfigRepo;
        private readonly IRepository<EntityProperty, Guid> _entityPropertyRepo;
        private readonly IPermissionedObjectManager _permissionedObjectManager;

        public string ItemType => EntityConfig.ItemTypeName;

        public EntityConfigExport(
            IRepository<EntityConfig, Guid> entityConfigRepo,
            IRepository<EntityProperty, Guid> entityPropertyRepo,
            IPermissionedObjectManager permissionedObjectManager
        )
        {
            _entityConfigRepo = entityConfigRepo;
            _entityPropertyRepo = entityPropertyRepo;
            _permissionedObjectManager = permissionedObjectManager;
        }

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ExportItemAsync(Guid id)
        {
            var entityConfig = await _entityConfigRepo.GetAsync(id);
            return await ExportItemAsync(entityConfig);
        }

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ExportItemAsync(ConfigurationItemBase item)
        {
            if (!(item is EntityConfig entityConfig))
                throw new ArgumentException($"Wrong type of argument {item}. Expected {nameof(EntityConfig)}, actual: {item.GetType().FullName}");

            var result = new DistributedEntityConfig
            {
                Id = entityConfig.Id,
                Name = entityConfig.Name,
                ModuleName = entityConfig.Module?.Name,
                FrontEndApplication = entityConfig.Application?.AppKey,
                ItemType = entityConfig.ItemType,

                Label = entityConfig.Label,
                Description = entityConfig.Description,
                OriginId = entityConfig.Origin?.Id,
                BaseItem = entityConfig.BaseItem?.Id,
                VersionNo = entityConfig.VersionNo,
                VersionStatus = entityConfig.VersionStatus,
                ParentVersionId = entityConfig.ParentVersion?.Id,
                Suppress = entityConfig.Suppress,

                // entity config specific properties
                FriendlyName = entityConfig.FriendlyName,
                TypeShortAlias = entityConfig.TypeShortAlias,
                TableName = entityConfig.TableName,
                ClassName = entityConfig.ClassName,
                Namespace = entityConfig.Namespace,
                DiscriminatorValue = entityConfig.DiscriminatorValue,
                GenerateAppService = entityConfig.GenerateAppService,
                Source = entityConfig.Source,
                EntityConfigType = entityConfig.EntityConfigType,
                PropertiesMD5 = entityConfig.HardcodedPropertiesMD5,
               
                ViewConfigurations = MapViewConfigurations(entityConfig),
                Properties = await MapPropertiesAsync(entityConfig),

                Permission = await _permissionedObjectManager.GetAsync($"{entityConfig.Namespace}.{entityConfig.ClassName}"),
                PermissionGet = await _permissionedObjectManager.GetAsync($"{entityConfig.Namespace}.{entityConfig.ClassName}@Get"),
                PermissionCreate = await _permissionedObjectManager.GetAsync($"{entityConfig.Namespace}.{entityConfig.ClassName}@Create"),
                PermissionUpdate = await _permissionedObjectManager.GetAsync($"{entityConfig.Namespace}.{entityConfig.ClassName}@Update"),
                PermissionDelete = await _permissionedObjectManager.GetAsync($"{entityConfig.Namespace}.{entityConfig.ClassName}@Delete"),
            };

            return result;
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
            if (src == null)
                return null;
            
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

            property.ItemsType = await MapPropertyAsync(src.ItemsType);
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
            return entityConfig.ViewConfigurations?.ToList();
        }

        /// inheritedDoc
        public async Task WriteToJsonAsync(DistributedConfigurableItemBase item, Stream jsonStream)
        {
            var json = JsonConvert.SerializeObject(item, Formatting.Indented);
            using (var writer = new StreamWriter(jsonStream))
            {
                await writer.WriteAsync(json);
            }
        }
    }
}