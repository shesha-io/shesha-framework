using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Runtime.Session;
using AutoMapper;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Distribution;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Dto.Interfaces;
using Shesha.DynamicEntities.Distribution.Dto;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Configuration.Runtime
{
    /// inheritedDoc
    public class EntityConfigManager : ConfigurationItemManager<EntityConfig>, IEntityConfigManager, ITransientDependency
    {
        private readonly IMapper _mapper;
        private readonly IRepository<EntityProperty, Guid> _propertyConfigRepo;

        public IAbpSession AbpSession { get; set; } = NullAbpSession.Instance;

        public EntityConfigManager(
            IRepository<EntityConfig, Guid> repository,
            IRepository<EntityProperty, Guid> propertyConfigRepo,
            IRepository<Module, Guid> moduleRepository,
            IUnitOfWorkManager unitOfWorkManager,
            IMapper mapper
        ) : base(repository, moduleRepository, unitOfWorkManager)
        {
            _propertyConfigRepo = propertyConfigRepo;
            _mapper = mapper;
        }

        public async Task<List<EntityConfigDto>> GetMainDataListAsync(IQueryable<EntityConfig> query = null, bool? implemented = null)
        {
            // Do not change to Mapper to avoid performance issues
            var result = await (query ?? Repository.GetAll())
                .Where(x => !x.IsDeleted)
                .Select(x => new EntityConfigDto()
                {
                    Id = x.Id,
                    ClassName = x.ClassName,
                    FriendlyName = x.FriendlyName,
                    TypeShortAlias = x.TypeShortAlias,
                    TableName = x.TableName,
                    Namespace = x.Namespace,
                    DiscriminatorValue = x.DiscriminatorValue,
                    Source = x.Source,
                    EntityConfigType = x.EntityConfigType,
                    Suppress = x.Suppress,
                    Module = x.Module.Name,
                    Name = x.Name,
                    Label = x.Label,

                    VersionStatus = x.VersionStatus,
                }).ToListAsync();
            return implemented ?? false
                ? result.Where(x => !x.NotImplemented).ToList()
                : result;
        }

        public override async Task<EntityConfig> CreateNewVersionAsync(EntityConfig item)
        {
            // todo: check business rules

            var newVersion =new EntityConfig();

            MapEntityConfig(item, newVersion);

            newVersion.ParentVersion = item; // set parent version
            newVersion.VersionNo = item.VersionNo + 1; // version + 1
            newVersion.VersionStatus = ConfigurationItemVersionStatus.Draft; // draft

            await Repository.InsertAsync(newVersion);

            await MapPropertiesAsync(item, newVersion);

            return newVersion;
        }

        protected EntityConfig MapEntityConfig(EntityConfig src, EntityConfig dest)
        {
            dest.Name = src.Name;
            dest.Module = src.Module;
            dest.Application = src.Application;
            dest.ItemType = src.ItemType;

            dest.Origin = src.Origin;
            dest.BaseItem = src.BaseItem;
            dest.ParentVersion = src.ParentVersion;

            dest.Label = src.Label;
            dest.Description = src.Description;
            dest.VersionNo = src.VersionNo;
            dest.VersionStatus = src.VersionStatus;
            dest.Suppress = src.Suppress;

            // entity config specific properties
            dest.FriendlyName = src.FriendlyName;
            dest.TypeShortAlias = src.TypeShortAlias;
            dest.TableName = src.TableName;
            dest.ClassName = src.ClassName;
            dest.Namespace = src.Namespace;
            dest.DiscriminatorValue = src.DiscriminatorValue;
            dest.GenerateAppService = src.GenerateAppService;
            dest.Source = src.Source;
            dest.EntityConfigType = src.EntityConfigType;
            dest.HardcodedPropertiesMD5 = src.HardcodedPropertiesMD5;

            dest.ViewConfigurations = src.ViewConfigurations.ToList();

            // ToDo: make permissioned objects versioned
            /*
            if (src.Permission != null)
                await _permissionedObjectManager.SetAsync(src.Permission);
            if (src.PermissionGet != null)
                await _permissionedObjectManager.SetAsync(src.PermissionGet);
            if (src.PermissionCreate != null)
                await _permissionedObjectManager.SetAsync(src.PermissionCreate);
            if (src.PermissionUpdate != null)
                await _permissionedObjectManager.SetAsync(src.PermissionUpdate);
            if (src.PermissionDelete != null)
                await _permissionedObjectManager.SetAsync(src.PermissionDelete);
            */
            return dest;
        }

        protected async Task MapPropertiesAsync(
            EntityConfig srcItem,
            EntityConfig item
        )
        {
            var properties = await _propertyConfigRepo.GetAllListAsync(x => x.EntityConfig == srcItem);
            foreach (var src in properties)
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

        public override Task<EntityConfig> CopyAsync(EntityConfig item, CopyItemInput input)
        {
            throw new NotImplementedException();
        }

        public override Task<IConfigurationItemDto> MapToDtoAsync(EntityConfig item)
        {
            throw new NotImplementedException();
        }
    }
}
