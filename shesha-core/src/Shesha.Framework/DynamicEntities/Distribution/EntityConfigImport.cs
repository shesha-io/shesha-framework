using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Runtime.Caching;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
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

            dbItem.ViewConfigurations = item.ViewConfigurations?.ToList() ?? new List<EntityViewConfigurationDto>();

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
            // all rows of the entity config are matched in memory and new rows are added as they are created:
            // a repository lookup misses rows that are not flushed yet and inserts a second row for the same path
            var existingProperties = await _propertyConfigRepo.GetAllListAsync(x => x.EntityConfig == item);
            var dbProperties = existingProperties.ToList();

            var importedIds = new HashSet<Guid>();
            await MapPropertiesAsync(item, ExcludeFlattenedCopies(Properties), null, dbProperties, importedIds);

            // delete properties absent from the imported package, mirroring
            // ModelConfigurationManager.cs's deletion semantics
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
            List<EntityProperty> dbProperties,
            HashSet<Guid> importedIds
        )
        {
            foreach (var src in properties)
            {
                var existing = FindProperty(dbProperties, parentProperty, src.Name);

                // the items type row of an array is also a child of the array. Older packages repeat it among the
                // array's Properties, but it is imported once - from ItemsType
                if (existing != null && existing.Id == parentProperty?.ItemsType?.Id)
                    continue;

                var dbItem = await MapPropertyAsync(item, src, parentProperty, existing, dbProperties);
                importedIds.Add(dbItem.Id);
                if (dbItem.ItemsType != null)
                    importedIds.Add(dbItem.ItemsType.Id);

                if (src.Properties != null && src.Properties.Any())
                    await MapPropertiesAsync(item, src.Properties, dbItem, dbProperties, importedIds);

                if (src.ItemsType?.Properties != null && src.ItemsType.Properties.Any())
                    await MapPropertiesAsync(item, src.ItemsType.Properties, dbItem.ItemsType, dbProperties, importedIds);
            }
        }

        private static EntityProperty FindProperty(List<EntityProperty> dbProperties, EntityProperty parentProperty, string name)
        {
            return dbProperties.FirstOrDefault(p => p.ParentProperty?.Id == parentProperty?.Id && string.Equals(p.Name, name, StringComparison.InvariantCultureIgnoreCase));
        }

        /// <summary>
        /// Packages exported before the exporter walked the property tree list every row of the entity config at the top
        /// level, so each nested row (a child property or an array items type) also appears as a root entry identical to
        /// its nested copy. Importing those copies turns nested rows into root properties and overwrites an array with
        /// its own items type, which shares its name.
        /// A tree cannot have two root properties with the same name (uq_Frwk_EntityProperties_Path), so a package that
        /// has them is flat - an identical root entry alone does not tell a copy from a root property that happens to
        /// match a nested one. In a flat package where every nested row has an identical root entry, those root
        /// entries are skipped. Any other package is imported as is.
        /// </summary>
        private static List<DistributedEntityConfigProperty> ExcludeFlattenedCopies(List<DistributedEntityConfigProperty> properties)
        {
            if (properties == null)
                return new List<DistributedEntityConfigProperty>();

            var isFlat = properties.GroupBy(p => p.Name, StringComparer.InvariantCultureIgnoreCase).Any(g => g.Count() > 1);
            if (!isFlat)
                return properties;

            // nested rows by path; an items type repeated among its array's Properties is the same row
            var nestedRows = new Dictionary<string, HashSet<string>>(StringComparer.InvariantCultureIgnoreCase);
            CollectNestedRows(properties, string.Empty, nestedRows);
            if (!nestedRows.Any())
                return properties;

            var roots = properties.Select(p => new { Property = p, Fields = GetOwnFields(p) }).ToList();
            var copies = new HashSet<DistributedEntityConfigProperty>();
            foreach (var nestedRow in nestedRows.Values)
            {
                var copy = roots.FirstOrDefault(r => !copies.Contains(r.Property) && nestedRow.Contains(r.Fields));
                if (copy == null)
                    return properties;

                copies.Add(copy.Property);
            }

            return properties.Where(p => !copies.Contains(p)).ToList();
        }

        private static void CollectNestedRows(List<DistributedEntityConfigProperty> properties, string parentPath, Dictionary<string, HashSet<string>> nestedRows)
        {
            if (properties == null)
                return;

            foreach (var property in properties)
            {
                var path = $"{parentPath}/{property.Name}";
                var isNested = !string.IsNullOrEmpty(parentPath);
                if (isNested)
                    AddNestedRow(nestedRows, path, property);

                if (property.ItemsType != null)
                {
                    var itemsTypePath = $"{path}/{property.ItemsType.Name}";
                    AddNestedRow(nestedRows, itemsTypePath, property.ItemsType);
                    CollectNestedRows(property.ItemsType.Properties, itemsTypePath, nestedRows);
                }

                CollectNestedRows(property.Properties, path, nestedRows);
            }
        }

        private static void AddNestedRow(Dictionary<string, HashSet<string>> nestedRows, string path, DistributedEntityConfigProperty property)
        {
            if (!nestedRows.TryGetValue(path, out var fields))
                nestedRows[path] = fields = new HashSet<string>();
            fields.Add(GetOwnFields(property));
        }

        /// <summary>
        /// Fields of the property itself, without its children, for comparing two entries of the same row
        /// </summary>
        private static string GetOwnFields(DistributedEntityConfigProperty property)
        {
            var json = JObject.FromObject(property);
            json.Remove(nameof(DistributedEntityConfigProperty.Properties));
            json.Remove(nameof(DistributedEntityConfigProperty.ItemsType));
            return json.ToString(Formatting.None);
        }

        private async Task<EntityProperty> MapPropertyAsync(
            EntityConfig item,
            DistributedEntityConfigProperty src,
            EntityProperty parentProperty,
            EntityProperty existing,
            List<EntityProperty> dbProperties
        )
        {
            var dbItem = await MapPropertyFieldsAsync(item, src, parentProperty, existing, dbProperties);

            // the items type is a child of its array, so a row without the ItemsType link is matched by its path
            dbItem.ItemsType = src.ItemsType != null
                ? await MapPropertyFieldsAsync(item, src.ItemsType, dbItem, dbItem.ItemsType ?? FindProperty(dbProperties, dbItem, src.ItemsType.Name), dbProperties)
                : null;

            await _propertyConfigRepo.InsertOrUpdateAsync(dbItem);

            return dbItem;
        }

        private async Task<EntityProperty> MapPropertyFieldsAsync(
            EntityConfig item,
            DistributedEntityConfigProperty src,
            EntityProperty parentProperty,
            EntityProperty existing,
            List<EntityProperty> dbProperties
        )
        {
            var dbItem = existing ?? new EntityProperty();

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

            await _propertyConfigRepo.InsertOrUpdateAsync(dbItem);
            if (!dbProperties.Contains(dbItem))
                dbProperties.Add(dbItem);

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
