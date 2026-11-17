using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Extensions;
using PluralizationService.Core.Builder.Base;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using Shesha.Permissions;
using Shesha.Reflection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Security.AccessControl;
using System.Threading.Tasks;

namespace Shesha.Configuration.Runtime
{
    /// inheritedDoc
    public class EntityConfigManager : ConfigurationItemManager<EntityConfig>, IEntityConfigManager, ITransientDependency
    {
        private readonly IPermissionedObjectManager _permissionedObjectManager;
        private readonly IRepository<PermissionedObject, Guid> _permissionedObjectRepository;
        public readonly IRepository<EntityProperty, Guid> PropertyConfigRepo;

        public EntityConfigManager(IPermissionedObjectManager permissionedObjectManager, IRepository<PermissionedObject, Guid> permissionedObjectRepository, IRepository<EntityProperty, Guid> propertyConfigRepo) : base()
        {
            _permissionedObjectManager = permissionedObjectManager;
            _permissionedObjectRepository = permissionedObjectRepository;
            PropertyConfigRepo = propertyConfigRepo;
        }

        public async Task<EntityConfig?> GetByEntityTypeIdAsync(EntityTypeIdentifier entityId)
        {
            return entityId.FullClassName.IsNullOrEmpty()
                ? await Repository.FirstOrDefaultAsync(x => x.Module != null && entityId.Module != null && x.Module.Name == entityId.Module && x.Name == entityId.Name)
                : await Repository.FirstOrDefaultAsync(x => x.FullClassName == entityId.FullClassName || x.TypeShortAlias == entityId.FullClassName);
        }

        public async Task<List<EntityConfigDto>> GetMainDataListAsync(IQueryable<EntityConfig>? query = null, bool? implemented = null)
        {
            // Do not change to Mapper to avoid performance issues
            var result = await (query ?? await Repository.GetAllAsync())
                .Where(x => !x.IsDeleted && x.Module != null)
                .Select(x => new EntityConfigDto()
                {
                    Id = x.Id,
                    Suppress = x.Suppress,

                    Name = x.Name,
                    Module = x.Module!.Name,

                    ClassName = x.ClassName,
                    TableName = x.TableName,
                    Namespace = x.Namespace,
                    DiscriminatorValue = x.DiscriminatorValue,

                    EntityConfigType = x.EntityConfigType,

                    Label = x.Label,
                    TypeShortAlias = x.TypeShortAlias,

                    Source = x.Source,

                    GenerateAppService = x.GenerateAppService,
                    IsConfigurable = x.IsConfigurable,
                }).ToListAsync();

            return implemented ?? false
                ? result.Where(x => !x.NotImplemented).ToList()
                : result;
        }

        protected async Task<EntityProperty?> CopyPropertiesAsync(
            IList<EntityProperty> properties,
            EntityConfig destination,
            EntityProperty? parentProperty = null,
            EntityProperty? srcItemsType = null
        )
        {
            EntityProperty? itemsType = null;

            foreach (var src in properties)
            {
                var property = new EntityProperty
                {
                    EntityConfig = destination,
                    Name = src.Name,
                    DataType = src.DataType,
                    ParentProperty = parentProperty,
                    Label = src.Label,
                    Description = src.Description,
                    DataFormat = src.DataFormat,
                    EntityFullClassName = src.EntityFullClassName,
                    EntityType = src.EntityType,
                    EntityModule = src.EntityModule,
                    ReferenceListName = src.ReferenceListName,
                    ReferenceListModule = src.ReferenceListModule,
                    IsFrameworkRelated = src.IsFrameworkRelated,

                    Min = src.Min,
                    Max = src.Max,
                    MinLength = src.MinLength,
                    MaxLength = src.MaxLength,
                    Suppress = src.Suppress,
                    Audited = src.Audited,
                    Required = src.Required,
                    ReadOnly = src.ReadOnly,
                    RegExp = src.RegExp,
                    ValidationMessage = src.ValidationMessage,

                    CascadeCreate = src.CascadeCreate,
                    CascadeUpdate = src.CascadeUpdate,
                    CascadeDeleteUnreferenced = src.CascadeDeleteUnreferenced,

                    ColumnName = src.ColumnName,

                    InitStatus = src.InitStatus,
                    InitMessage = src.InitMessage,
                    CreatedInDb = src.CreatedInDb,

                    Formatting = src.Formatting,
                    InheritedFrom = src.InheritedFrom,
                    ListConfiguration = src.ListConfiguration,
                    SortOrder = src.SortOrder,
                    Source = src.Source,
                };
                if (parentProperty != null)
                    parentProperty.Properties.Add(property);

                property.ItemsType = await CopyPropertiesAsync(src.Properties, destination, property, src.ItemsType);

                await PropertyConfigRepo.InsertOrUpdateAsync(property);

                if (src == srcItemsType)
                    itemsType = property;
            }

            return itemsType;
        }

        protected override async Task CopyItemPropertiesAsync(EntityConfig source, EntityConfig destination)
        {

            destination.Label = source.Label;
            destination.Description = source.Description;

            destination.SchemaName = source.SchemaName;
            destination.TableName = source.TableName;
            destination.DiscriminatorValue = source.DiscriminatorValue;

            destination.ClassName = source.ClassName;
            destination.Namespace = source.Namespace;
            destination.EntityConfigType = source.EntityConfigType;
            destination.InheritedFrom = source.InheritedFrom;

            destination.TypeShortAlias = source.TypeShortAlias;
            destination.HardcodedPropertiesMD5 = source.HardcodedPropertiesMD5;
            destination.ViewConfigurations = source.ViewConfigurations?.Select(v => v.Clone()).ToList() ?? new List<EntityViewConfigurationDto>();
            destination.GenerateAppService = source.GenerateAppService;
            destination.IsConfigurable = source.IsConfigurable;
            destination.Source = source.Source;
            destination.Accessor = source.Accessor;

            var properties = await PropertyConfigRepo.GetAllListAsync(x => x.EntityConfig == source && x.ParentProperty == null);
            await CopyPropertiesAsync(properties, destination);
        }

        protected override async Task AfterItemExposedAsync(EntityConfig exposedItem)
        {
            var sourceItem = exposedItem.ExposedFrom.NotNull().ForceCastAs<EntityConfig>();
            var dstModule = exposedItem.Module.NotNull();

            var sourceName = sourceItem.FullClassName;

            // TODO: review after IPermissionedObjectManager refactoring, currently it doesn't take modules into account
            var srcPos = await (await _permissionedObjectRepository.GetAllAsync())
                .Where(x => x.Module == sourceItem.Module && 
                    (x.Type == ShaPermissionedObjectsTypes.Entity && x.Object == sourceName || x.Parent == sourceName)
                ).ToListAsync();

            foreach (var srcPo in srcPos) 
            {
                var dstPo = await GetExistingPermissionedObjectAsync(dstModule, srcPo.Type, srcPo.Object) ?? new PermissionedObject();
                srcPo.CopyPropsTo(dstPo);
                dstPo.Module = dstModule;

                await _permissionedObjectRepository.InsertOrUpdateAsync(dstPo);                
            }            
        }

        private async Task<PermissionedObject?> GetExistingPermissionedObjectAsync(Module module, string? type, string @object) 
        {
            return await _permissionedObjectRepository.FirstOrDefaultAsync(x => x.Module == module && x.Type == type && x.Object == @object);
        }
    }
}
