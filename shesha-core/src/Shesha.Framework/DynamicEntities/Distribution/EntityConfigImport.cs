using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using FluentMigrator.Runner.Versioning;
using NetTopologySuite.Index.HPRtree;
using Newtonsoft.Json;
using NUglify.JavaScript.Syntax;
using NUglify;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Distribution.Dto;
using Shesha.Extensions;
using Shesha.Services.ReferenceLists;
using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Shesha.Services.ConfigurationItems;
using Shesha.Permissions;
using System.Linq;
using Shesha.Configuration.Runtime;
using Abp.Runtime.Caching;
using Shesha.DynamicEntities.Dtos;

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
        private readonly ICacheManager _cacheManager;

        public ITypedCache<string, ModelConfigurationDto> ModelConfigsCache =>
            _cacheManager.GetCache<string, ModelConfigurationDto>($"{this.GetType().Name}_models");


        public EntityConfigImport(
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IRepository<EntityConfig, Guid> entityConfigRepo,
            IRepository<EntityProperty, Guid> propertyConfigRepo,
            IPermissionedObjectManager permissionedObjectManager,
            IEntityConfigManager entityConfigManager,
            ICacheManager cacheManager,
            IUnitOfWorkManager unitOfWorkManager
        ): base (moduleRepo, frontEndAppRepo)
        {
            _entityConfigRepo = entityConfigRepo;
            _propertyConfigRepo = propertyConfigRepo;
            _unitOfWorkManager = unitOfWorkManager;
            _permissionedObjectManager = permissionedObjectManager;
            _entityConfigManager = entityConfigManager;
            _cacheManager = cacheManager;
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

                // ToDo: Tempjrary update the current version.
                // Need to update the rest of the other code to work with versioning EntityConfigs first

                await MapEntityConfigAync(item, dbItem, context);
                await _entityConfigRepo.UpdateAsync(dbItem);

                await MapPropertiesAsync(dbItem, item.Properties);

                await ModelConfigsCache.RemoveAsync($"{dbItem.Namespace}|{dbItem.ClassName}");

                return dbItem;

                /*switch (dbItem.VersionStatus)
                {
                    case ConfigurationItemVersionStatus.Draft:
                    case ConfigurationItemVersionStatus.Ready:
                        {
                            // cancel existing version
                            await _entityConfigManager.CancelVersoinAsync(dbItem);
                            break;
                        }
                }
                // mark existing live form as retired if we import new form as live
                if (statusToImport == ConfigurationItemVersionStatus.Live)
                {
                    var liveForm = dbItem.VersionStatus == ConfigurationItemVersionStatus.Live
                        ? dbItem
                        : await _entityConfigRepo.FirstOrDefaultAsync(f => f.Name == item.Name && (f.Module == null && item.ModuleName == null || f.Module.Name == item.ModuleName) && f.VersionStatus == ConfigurationItemVersionStatus.Live);
                    if (liveForm != null)
                    {
                        await _entityConfigManager.UpdateStatusAsync(liveForm, ConfigurationItemVersionStatus.Retired);
                        await _unitOfWorkManager.Current.SaveChangesAsync(); // save changes to guarantee sequence of update
                    }
                }

                // create new version
                var newItemVersion = await _entityConfigManager.CreateNewVersionAsync(dbItem);
                await MapEntityConfigAync(item, newItemVersion, context);
                await MapPropertiesAsync(dbItem, item.Properties);

                // important: set status according to the context
                newItemVersion.VersionStatus = statusToImport;
                newItemVersion.CreatedByImport = context.ImportResult;
                newItemVersion.Normalize();

                await _entityConfigRepo.UpdateAsync(newItemVersion);

                await ModelConfigsCache.RemoveAsync($"{newItemVersion.Namespace}|{newItemVersion.ClassName}");

                return newItemVersion;*/
            }
            else
            {
                var newItem = new EntityConfig();
                await MapEntityConfigAync(item, newItem, context);

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

        protected async Task<EntityConfig> MapEntityConfigAync(DistributedEntityConfig item, EntityConfig dbItem, IConfigurationItemsImportContext context)
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
            dbItem.VersionNo = item.VersionNo;
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
            
            if (item.Permission != null)
                await _permissionedObjectManager.SetAsync(item.Permission);
            if (item.PermissionGet != null)
                await _permissionedObjectManager.SetAsync(item.PermissionGet);
            if (item.PermissionCreate != null)
                await _permissionedObjectManager.SetAsync(item.PermissionCreate);
            if (item.PermissionUpdate != null)
                await _permissionedObjectManager.SetAsync(item.PermissionUpdate);
            if (item.PermissionDelete != null)
                await _permissionedObjectManager.SetAsync(item.PermissionDelete);

            return dbItem;
        }

        protected async Task MapPropertiesAsync(
            EntityConfig item,
            List<DistributedEntityConfigProperty> Properties
        )
        {
            foreach (var src in Properties)
            {
                var dbItem = await _propertyConfigRepo.FirstOrDefaultAsync(x => x.Name == src.Name && x.EntityConfig == item)
                    ?? new EntityProperty();
                
                dbItem.EntityConfig = item;
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

                _propertyConfigRepo.InsertOrUpdate(dbItem);
            }
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
