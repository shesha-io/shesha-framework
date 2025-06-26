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
    public class EntityConfigImport : ConfigurationItemImportBase<EntityConfig, EntityConfigRevision, DistributedEntityConfig>, IEntityConfigImport, ITransientDependency
    {
        public string ItemType => EntityConfig.ItemTypeName;

        private readonly IRepository<EntityProperty, Guid> _propertyConfigRepo;
        private readonly IPermissionedObjectManager _permissionedObjectManager;
        private readonly ITypedCache<string, ModelConfigurationDto?> _modelConfigsCache;
        private readonly IModelConfigsCacheHolder _modelConfigsCacheHolder;
        

        public EntityConfigImport(
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IRepository<EntityConfig, Guid> repository,
            IRepository<EntityConfigRevision, Guid> revisionRepository,
            IRepository<EntityProperty, Guid> propertyConfigRepo,
            IPermissionedObjectManager permissionedObjectManager,
            IModelConfigsCacheHolder modelConfigsCacheHolder
        ) : base (repository, revisionRepository, moduleRepo, frontEndAppRepo)
        {
            _propertyConfigRepo = propertyConfigRepo;
            _permissionedObjectManager = permissionedObjectManager;
            _modelConfigsCacheHolder = modelConfigsCacheHolder;
            _modelConfigsCache = modelConfigsCacheHolder.Cache;
        }

        protected override async Task AfterImportAsync(EntityConfig item, EntityConfigRevision revision, DistributedEntityConfig distributedItem, IConfigurationItemsImportContext context)
        {
            await MapPropertiesAsync(item, distributedItem.Properties);
            
            var key = _modelConfigsCacheHolder.GetCacheKey(revision.Namespace, revision.ClassName);
            await _modelConfigsCache.RemoveAsync(key);
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

        protected override Task<bool> CustomPropsAreEqualAsync(EntityConfig item, EntityConfigRevision revision, DistributedEntityConfig distributedItem)
        {
            // TODO: review comparison
            var equals = revision.TypeShortAlias == distributedItem.TypeShortAlias &&
                revision.ClassName == distributedItem.ClassName &&
                revision.Namespace == distributedItem.Namespace &&
                revision.DiscriminatorValue == distributedItem.DiscriminatorValue &&
                revision.Source == distributedItem.Source &&
                revision.EntityConfigType == distributedItem.EntityConfigType &&

                revision.GenerateAppService == distributedItem.GenerateAppService &&
                revision.FriendlyName == distributedItem.FriendlyName &&
                revision.HardcodedPropertiesMD5 == distributedItem.PropertiesMD5 &&
                // TODO: implement 
                //revision.ViewConfigurations == distributedItem.ViewConfigurations.ToList() &&
                revision.TableName == distributedItem.TableName;

            return Task.FromResult(equals);
        }

        protected override async Task MapCustomPropsToItemAsync(EntityConfig item, EntityConfigRevision revision, DistributedEntityConfig distributedItem)
        {
            // entity config specific properties
            revision.TypeShortAlias = distributedItem.TypeShortAlias;
            revision.ClassName = distributedItem.ClassName;
            revision.Namespace = distributedItem.Namespace;
            revision.DiscriminatorValue = distributedItem.DiscriminatorValue;
            revision.Source = distributedItem.Source;
            revision.EntityConfigType = distributedItem.EntityConfigType;

            revision.GenerateAppService = distributedItem.GenerateAppService;
            revision.FriendlyName = distributedItem.FriendlyName;
            revision.HardcodedPropertiesMD5 = distributedItem.PropertiesMD5;
            revision.ViewConfigurations = distributedItem.ViewConfigurations.ToList();
            revision.TableName = distributedItem.TableName;

            if (distributedItem.Permission != null)
            {
                // fix Type for old configurations
                distributedItem.Permission.Type = ShaPermissionedObjectsTypes.Entity;
                await _permissionedObjectManager.SetAsync(distributedItem.Permission);
            }
            if (distributedItem.PermissionGet != null)
            {
                distributedItem.PermissionGet.Type = ShaPermissionedObjectsTypes.Entity;
                await _permissionedObjectManager.SetAsync(distributedItem.PermissionGet);
            }
            if (distributedItem.PermissionCreate != null)
            {
                distributedItem.PermissionCreate.Type = ShaPermissionedObjectsTypes.Entity;
                await _permissionedObjectManager.SetAsync(distributedItem.PermissionCreate);
            }
            if (distributedItem.PermissionUpdate != null)
            {
                distributedItem.PermissionUpdate.Type = ShaPermissionedObjectsTypes.Entity;
                await _permissionedObjectManager.SetAsync(distributedItem.PermissionUpdate);
            }
            if (distributedItem.PermissionDelete != null)
            {
                distributedItem.PermissionDelete.Type = ShaPermissionedObjectsTypes.Entity;
                await _permissionedObjectManager.SetAsync(distributedItem.PermissionDelete);
            }
        }
    }
}