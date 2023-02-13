using Abp.Dependency;
using Abp.Domain.Repositories;
using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
using Shesha.ConfigurationItems.Exceptions;
using Shesha.Domain;
using Shesha.DynamicEntities.Distribution.Dto;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
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

        public string ItemType => EntityConfig.ItemTypeName;

        public EntityConfigExport(IRepository<EntityConfig, Guid> entityConfigRepo, IRepository<EntityProperty, Guid> entityPropertyRepo)
        {
            _entityConfigRepo = entityConfigRepo;
            _entityPropertyRepo = entityPropertyRepo;
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

            if (entityConfig.Configuration == null)
                throw new ConfigurationMissingException(entityConfig);

            var result = new DistributedEntityConfig
            {
                Id = entityConfig.Id,
                Name = entityConfig.Configuration.Name,
                ModuleName = entityConfig.Configuration.Module?.Name,
                FrontEndApplication = entityConfig.Configuration.Application?.AppKey,
                ItemType = entityConfig.Configuration.ItemType,

                Label = entityConfig.Configuration.Label,
                Description = entityConfig.Configuration.Description,
                OriginId = entityConfig.Configuration.Origin?.Id,
                BaseItem = entityConfig.Configuration.BaseItem?.Id,
                VersionNo = entityConfig.Configuration.VersionNo,
                VersionStatus = entityConfig.Configuration.VersionStatus,
                ParentVersionId = entityConfig.Configuration.ParentVersion?.Id,
                Suppress = entityConfig.Configuration.Suppress,

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
                PropertiesMD5 = entityConfig.PropertiesMD5,
               
                ViewConfigurations = MapViewConfigurations(entityConfig),
                Properties = await MapViewPropertiesAsync(entityConfig),
            };

            return result;
        }
        
        private async Task<List<DistributedEntityConfigProperty>> MapViewPropertiesAsync(EntityConfig entityConfig)
        {
            var properties = await _entityPropertyRepo.GetAll().Where(p => p.EntityConfig == entityConfig).ToListAsync();
            return properties.Select(vc => new DistributedEntityConfigProperty { 
                
            }).ToList();
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