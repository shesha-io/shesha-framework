using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Runtime.Caching;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.DynamicEntities.Cache;
using Shesha.DynamicEntities.Distribution.Dto;
using Shesha.DynamicEntities.Dtos;
using Shesha.Permissions;
using Shesha.Services.ConfigurationItems;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Distribution
{
    /// inheritedDoc
    public class EntityConfigImport : ConfigurationItemImportBase<EntityConfig, DistributedEntityConfig>, IEntityConfigImport, ITransientDependency
    {
        public string ItemType => EntityConfig.ItemTypeName;

        private readonly IRepository<EntityConfig, Guid> _entityConfigRepo;
        private readonly IRepository<EntityProperty, Guid> _propertyConfigRepo;
        private readonly IPermissionedObjectManager _permissionedObjectManager;
        private readonly ITypedCache<string, ModelConfigurationDto?> _modelConfigsCache;
        private readonly IModelConfigsCacheHolder _modelConfigsCacheHolder;
        

        public EntityConfigImport(
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IRepository<EntityConfig, Guid> entityConfigRepo,
            IRepository<EntityProperty, Guid> propertyConfigRepo,
            IPermissionedObjectManager permissionedObjectManager,
            IModelConfigsCacheHolder modelConfigsCacheHolder
        ) : base (moduleRepo, frontEndAppRepo)
        {
            _entityConfigRepo = entityConfigRepo;
            _propertyConfigRepo = propertyConfigRepo;
            _permissionedObjectManager = permissionedObjectManager;
            _modelConfigsCacheHolder = modelConfigsCacheHolder;
            _modelConfigsCache = modelConfigsCacheHolder.Cache;
        }

        public Task<ConfigurationItem> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!(item is DistributedEntityConfig distributedEntityConfig))
                throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(DistributedEntityConfig)}. Actual type is {item.GetType().FullName}");

            return ImportEntityConfigAsync(distributedEntityConfig, context);
        }

        protected async Task<ConfigurationItem> ImportEntityConfigAsync(DistributedEntityConfig item, IConfigurationItemsImportContext context) 
        {
            // get DB config
            var dbItem = await _entityConfigRepo.FirstOrDefaultAsync(x => x.Module == null && item.ModuleName == null || x.Module != null && x.Module.Name == item.ModuleName);

            if (dbItem != null)
            {
                await MapEntityConfigAsync(item, dbItem, context);
                await _entityConfigRepo.UpdateAsync(dbItem);

                await MapPropertiesAsync(dbItem, item.Properties);

                var key = _modelConfigsCacheHolder.GetCacheKey(dbItem.LatestRevision.Namespace, dbItem.LatestRevision.ClassName);
                await _modelConfigsCache.RemoveAsync(key);

                return dbItem;
            }
            else
            {
                var newItem = new EntityConfig();
                await MapEntityConfigAsync(item, newItem, context);

                newItem.Module = await GetModuleAsync(item.ModuleName, context);

                // TODO: V1 review
                //newItem.CreatedByImport = context.ImportResult;

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

            var revision = dbItem.EnsureLatestRevision();

            revision.Label = item.Label;
            revision.Description = item.Description;

            dbItem.Suppress = item.Suppress;

            // entity config specific properties
            revision.TypeShortAlias = item.TypeShortAlias;
            revision.ClassName = item.ClassName;
            revision.Namespace = item.Namespace;
            revision.DiscriminatorValue = item.DiscriminatorValue;
            revision.Source = item.Source;
            revision.EntityConfigType = item.EntityConfigType;

            revision.GenerateAppService = item.GenerateAppService;
            revision.FriendlyName = item.FriendlyName;
            revision.HardcodedPropertiesMD5 = item.PropertiesMD5;
            revision.ViewConfigurations = item.ViewConfigurations.ToList();
            revision.TableName = item.TableName;

            if (item.Permission != null)
            {
                // fix Type for old configurations
                item.Permission.Type = ShaPermissionedObjectsTypes.Entity;
                await _permissionedObjectManager.SetAsync(item.Permission);
            }
            if (item.PermissionGet != null)
            {
                item.PermissionGet.Type = ShaPermissionedObjectsTypes.Entity;
                await _permissionedObjectManager.SetAsync(item.PermissionGet);
            }
            if (item.PermissionCreate != null)
            {
                item.PermissionCreate.Type = ShaPermissionedObjectsTypes.Entity;
                await _permissionedObjectManager.SetAsync(item.PermissionCreate);
            }
            if (item.PermissionUpdate != null)
            {
                item.PermissionUpdate.Type = ShaPermissionedObjectsTypes.Entity;
                await _permissionedObjectManager.SetAsync(item.PermissionUpdate);
            }
            if (item.PermissionDelete != null)
            {
                item.PermissionDelete.Type = ShaPermissionedObjectsTypes.Entity;
                await _permissionedObjectManager.SetAsync(item.PermissionDelete);
            }

            return dbItem;
        }

        protected async Task MapPropertiesAsync(
            EntityConfig item,
            List<DistributedEntityConfigProperty> Properties
        )
        {
            var revision = item.EnsureLatestRevision();

            foreach (var src in Properties)
            {
                // TODO: V1 review. fetch all properties and compare
                var dbItem = await _propertyConfigRepo.FirstOrDefaultAsync(x => x.Name == src.Name && x.EntityConfigRevision == revision)
                    ?? new EntityProperty() { EntityConfigRevision = revision };
                
                dbItem.Name = src.Name;
                dbItem.Label = src.Label;
                dbItem.Description = src.Description;
                dbItem.DataType = src.DataType;
                dbItem.DataFormat = src.DataFormat;
                dbItem.EntityType = src.EntityType;
                dbItem.ReferenceListName = src.ReferenceListName;
                dbItem.ReferenceListModule = src.ReferenceListModule;
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
            }
        }
    }
}