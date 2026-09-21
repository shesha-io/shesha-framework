using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Runtime.Caching;
using Newtonsoft.Json;
using Shesha.Configuration.Runtime;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.DynamicEntities.Cache;
using Shesha.DynamicEntities.Distribution.Dto;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using Shesha.Permissions;
using Shesha.Services.ConfigurationItems;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Distribution
{
    /// inheritedDoc
    public class EntityConfigImport : ConfigurationItemImportBase, IEntityConfigImport, ITransientDependency
    {
        public string ItemType => EntityConfig.ItemTypeName;

        private readonly IRepository<EntityConfig, Guid> _entityConfigRepo;
        private readonly IRepository<EntityProperty, Guid> _propertyConfigRepo;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly IPermissionedObjectManager _permissionedObjectManager;
        private readonly IEntityConfigManager _entityConfigManager;
        private readonly ITypedCache<string, ModelConfigurationDto> _modelConfigsCache;

        public EntityConfigImport(
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IRepository<EntityConfig, Guid> entityConfigRepo,
            IRepository<EntityProperty, Guid> propertyConfigRepo,
            IPermissionedObjectManager permissionedObjectManager,
            IEntityConfigManager entityConfigManager,
            IUnitOfWorkManager unitOfWorkManager,
            IModelConfigsCacheHolder modelConfigsCacheHolder
        ) : base (moduleRepo, frontEndAppRepo)
        {
            _entityConfigRepo = entityConfigRepo;
            _propertyConfigRepo = propertyConfigRepo;
            _unitOfWorkManager = unitOfWorkManager;
            _permissionedObjectManager = permissionedObjectManager;
            _entityConfigManager = entityConfigManager;
            _modelConfigsCache = modelConfigsCacheHolder.Cache;
        }

        public async Task<ConfigurationItemBase> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!(item is DistributedEntityConfig distributedEntityConfig))
                throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(DistributedEntityConfig)}. Actual type is {item.GetType().FullName}");

            return await ImportEntityConfigAsync(distributedEntityConfig, context);
        }

        protected async Task<ConfigurationItemBase> ImportEntityConfigAsync(DistributedEntityConfig item, IConfigurationItemsImportContext context) 
        {
            // use status specified in the context with fallback to imported value
            var statusToImport = context.ImportStatusAs ?? item.VersionStatus;

            // get DB config
            var dbItem = await _entityConfigRepo.FirstOrDefaultAsync(x =>
                x.Namespace == item.Namespace && x.ClassName == item.ClassName
                //x.Name == item.Name 
                && (x.Module == null && item.ModuleName == null || x.Module.Name == item.ModuleName)
                && x.IsLast);

            if (dbItem != null)
            {
                // entity versioning is not implemented for this release -- update the existing config in place
                await MapEntityConfigAsync(item, dbItem, context);

                dbItem.VersionStatus = statusToImport;
                dbItem.CreatedByImport = context.ImportResult;
                dbItem.Normalize();

                await _entityConfigRepo.UpdateAsync(dbItem);

                await MapPropertiesAsync(dbItem, item.Properties);

                await _modelConfigsCache.RemoveAsync($"{dbItem.Namespace}|{dbItem.ClassName}");

                return dbItem;
            }
            else
            {
                var newItem = new EntityConfig();
                await MapEntityConfigAsync(item, newItem, context);

                // fill audit?
                newItem.VersionNo = 1;
                newItem.Module = await GetModuleAsync(item.ModuleName, context);

                // important: set status according to the context
                newItem.VersionStatus = statusToImport;
                newItem.CreatedByImport = context.ImportResult;

                newItem.Normalize();

                await _entityConfigRepo.InsertAsync(newItem);

                await MapPropertiesAsync(newItem, item.Properties);

                return newItem;
            }
        }

        protected async Task<EntityConfig> MapEntityConfigAsync(DistributedEntityConfig item, EntityConfig dbItem, IConfigurationItemsImportContext context)
        {
            dbItem.Name = item.Name;
            dbItem.Module = await GetModuleAsync(item.ModuleName, context);
            dbItem.Application = await GetFrontEndAppAsync(item.FrontEndApplication, context);
            dbItem.ItemType = item.ItemType;

            //dbItem.Origin = item.OriginId;
            //dbItem.BaseItem = item.BaseItem;
            //dbItem.ParentVersion = item.ParentVersionId;

            dbItem.Label = item.Label;
            dbItem.Description = item.Description;
            dbItem.VersionStatus = item.VersionStatus;
            dbItem.Suppress = item.Suppress;

            // entity config specific properties
            dbItem.FriendlyName = item.FriendlyName;
            dbItem.TypeShortAlias = item.TypeShortAlias;
            dbItem.TableName = item.TableName;
            dbItem.ClassName = item.ClassName;
            dbItem.Namespace = item.Namespace;
            dbItem.DiscriminatorValue = item.DiscriminatorValue;
            dbItem.GenerateAppService = item.GenerateAppService;
            dbItem.Source = item.Source;
            dbItem.EntityConfigType = item.EntityConfigType;
            dbItem.HardcodedPropertiesMD5 = item.PropertiesMD5;

            dbItem.ViewConfigurations = item.ViewConfigurations.ToList();

            // parent permission is Entity; CRUD actions must be EntityAction or lookups silently fall back to DefaultEndpointAccess
            await SetPermissionAsync(item.Permission, ShaPermissionedObjectsTypes.Entity);
            await SetPermissionAsync(item.PermissionGet, ShaPermissionedObjectsTypes.EntityAction);
            await SetPermissionAsync(item.PermissionCreate, ShaPermissionedObjectsTypes.EntityAction);
            await SetPermissionAsync(item.PermissionUpdate, ShaPermissionedObjectsTypes.EntityAction);
            await SetPermissionAsync(item.PermissionDelete, ShaPermissionedObjectsTypes.EntityAction);

            return dbItem;
        }

        private async Task SetPermissionAsync(PermissionedObjectDto permission, string type)
        {
            if (permission == null)
                return;

            permission.Type = type;
            await _permissionedObjectManager.SetAsync(permission);
        }

        protected async Task MapPropertiesAsync(
            EntityConfig item,
            List<DistributedEntityConfigProperty> Properties
        )
        {
            var importedIds = new HashSet<Guid>();
            await MapPropertiesAsync(item, Properties, null, importedIds);

            // delete properties absent from the imported package, mirroring
            // ModelConfigurationManager.cs's deletion semantics
            var existingProperties = await _propertyConfigRepo.GetAllListAsync(x => x.EntityConfig == item);
            var toDelete = existingProperties.Where(p => !p.Name.IsSpecialProperty() && !importedIds.Contains(p.Id)).ToList();
            foreach (var prop in toDelete)
            {
                await _propertyConfigRepo.DeleteAsync(prop);
            }
        }

        private async Task MapPropertiesAsync(
            EntityConfig item,
            List<DistributedEntityConfigProperty> properties,
            EntityProperty parentProperty,
            HashSet<Guid> importedIds
        )
        {
            foreach (var src in properties)
            {
                var dbItem = await MapPropertyAsync(item, src, parentProperty);
                importedIds.Add(dbItem.Id);

                if (src.Properties != null && src.Properties.Any())
                    await MapPropertiesAsync(item, src.Properties, dbItem, importedIds);
            }
        }

        private async Task<EntityProperty> MapPropertyAsync(
            EntityConfig item,
            DistributedEntityConfigProperty src,
            EntityProperty parentProperty
        )
        {
            var dbItem = parentProperty != null
                ? await _propertyConfigRepo.FirstOrDefaultAsync(x => x.Name == src.Name && x.ParentProperty == parentProperty)
                : await _propertyConfigRepo.FirstOrDefaultAsync(x => x.Name == src.Name && x.EntityConfig == item && x.ParentProperty == null);
            dbItem = dbItem ?? new EntityProperty();

            dbItem.EntityConfig = item;
            dbItem.ParentProperty = parentProperty;
            dbItem.Name = src.Name;
            dbItem.Label = src.Label;
            dbItem.Description = src.Description;
            dbItem.DataType = src.DataType;
            dbItem.DataFormat = src.DataFormat;
            dbItem.EntityType = src.EntityType;
            dbItem.ReferenceListName = src.ReferenceListName;
            dbItem.ReferenceListModule = src.ReferenceListModule;
            dbItem.Source = src.Source;
            dbItem.SortOrder = src.SortOrder;
            dbItem.IsFrameworkRelated = src.IsFrameworkRelated;

            dbItem.Min = src.Min;
            dbItem.Max = src.Max;
            dbItem.MinLength = src.MinLength;
            dbItem.MaxLength = src.MaxLength;
            dbItem.Suppress = src.Suppress;
            dbItem.Audited = src.Audited;
            dbItem.Required = src.Required;
            dbItem.ReadOnly = src.ReadOnly;
            dbItem.RegExp = src.RegExp;
            dbItem.ValidationMessage = src.ValidationMessage;

            dbItem.CascadeCreate = src.CascadeCreate;
            dbItem.CascadeUpdate = src.CascadeUpdate;
            dbItem.CascadeDeleteUnreferenced = src.CascadeDeleteUnreferenced;

            if (src.ItemsType != null)
            {
                dbItem.ItemsType = await MapItemsTypeAsync(item, src.ItemsType, dbItem);
            }
            else if (dbItem.ItemsType != null)
            {
                var oldItemsType = dbItem.ItemsType;
                dbItem.ItemsType = null;
                await _propertyConfigRepo.DeleteAsync(oldItemsType);
            }

            await _propertyConfigRepo.InsertOrUpdateAsync(dbItem);

            return dbItem;
        }

        private async Task<EntityProperty> MapItemsTypeAsync(
            EntityConfig item,
            DistributedEntityConfigProperty src,
            EntityProperty ownerProperty
        )
        {
            var dbItem = ownerProperty.ItemsType ?? new EntityProperty();

            // standalone row describing the array element type -- not part of the entity's own Properties tree
            dbItem.EntityConfig = null;
            dbItem.ParentProperty = null;
            dbItem.Name = src.Name;
            dbItem.Label = src.Label;
            dbItem.Description = src.Description;
            dbItem.DataType = src.DataType;
            dbItem.DataFormat = src.DataFormat;
            dbItem.EntityType = src.EntityType;
            dbItem.ReferenceListName = src.ReferenceListName;
            dbItem.ReferenceListModule = src.ReferenceListModule;
            dbItem.Source = src.Source;
            dbItem.SortOrder = src.SortOrder;
            dbItem.IsFrameworkRelated = src.IsFrameworkRelated;

            dbItem.Min = src.Min;
            dbItem.Max = src.Max;
            dbItem.MinLength = src.MinLength;
            dbItem.MaxLength = src.MaxLength;
            dbItem.Suppress = src.Suppress;
            dbItem.Audited = src.Audited;
            dbItem.Required = src.Required;
            dbItem.ReadOnly = src.ReadOnly;
            dbItem.RegExp = src.RegExp;
            dbItem.ValidationMessage = src.ValidationMessage;

            dbItem.CascadeCreate = src.CascadeCreate;
            dbItem.CascadeUpdate = src.CascadeUpdate;
            dbItem.CascadeDeleteUnreferenced = src.CascadeDeleteUnreferenced;

            await _propertyConfigRepo.InsertOrUpdateAsync(dbItem);

            return dbItem;
        }

        public async Task<DistributedConfigurableItemBase> ReadFromJsonAsync(Stream jsonStream)
        {
            using (var reader = new StreamReader(jsonStream))
            {
                var json = await reader.ReadToEndAsync();
                return JsonConvert.DeserializeObject<DistributedEntityConfig>(json);
            }
        }
    }
}
