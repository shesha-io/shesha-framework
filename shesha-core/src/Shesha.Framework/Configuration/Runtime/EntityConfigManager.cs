using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Runtime.Session;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Dto.Interfaces;
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
        private readonly IRepository<EntityProperty, Guid> _propertyConfigRepo;

        public IAbpSession AbpSession { get; set; } = NullAbpSession.Instance;

        public EntityConfigManager(IRepository<EntityProperty, Guid> propertyConfigRepo) : base()
        {
            _propertyConfigRepo = propertyConfigRepo;
        }

        public async Task<List<EntityConfigDto>> GetMainDataListAsync(IQueryable<EntityConfig>? query = null, bool? implemented = null)
        {
            // Do not change to Mapper to avoid performance issues
            var result = await (query ?? Repository.GetAll())
                .Where(x => !x.IsDeleted && x.Module != null)
                .Select(x => new EntityConfigDto()
                {
                    Id = x.Id,
                    
                    ClassName = x.Revision.ClassName,
                    FriendlyName = x.Revision.FriendlyName,
                    Label = x.Revision.Label,
                    TypeShortAlias = x.Revision.TypeShortAlias,
                    TableName = x.Revision.TableName,
                    Namespace = x.Revision.Namespace,
                    DiscriminatorValue = x.Revision.DiscriminatorValue,

                    Source = x.Revision.Source,
                    EntityConfigType = x.Revision.EntityConfigType,
                    Suppress = x.Suppress,
                    Module = x.Module!.Name,
                    Name = x.Name,
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

            var revision = dest.EnsureLatestRevision();
            var srcRevision = src.Revision;
            revision.Label = srcRevision.Label;
            revision.Description = srcRevision.Description;

            dest.Suppress = src.Suppress;

            // entity config specific properties
            revision.TypeShortAlias = srcRevision.TypeShortAlias;
            revision.ClassName = srcRevision.ClassName;
            revision.Namespace = srcRevision.Namespace;
            revision.DiscriminatorValue = srcRevision.DiscriminatorValue;
            revision.Source = srcRevision.Source;
            revision.EntityConfigType = srcRevision.EntityConfigType;

            revision.GenerateAppService = srcRevision.GenerateAppService;
            revision.FriendlyName = srcRevision.FriendlyName;
            revision.HardcodedPropertiesMD5 = srcRevision.HardcodedPropertiesMD5;
            revision.ViewConfigurations = srcRevision.ViewConfigurations.ToList();
            revision.TableName = srcRevision.TableName;

            return dest;
        }

        protected async Task MapPropertiesAsync(
            EntityConfig srcItem,
            EntityConfig item
        )
        {
            var properties = await _propertyConfigRepo.GetAllListAsync(x => x.EntityConfigRevision == srcItem.Revision);
            var revision = item.EnsureLatestRevision();
            foreach (var src in properties)
            {
                var dbItem = await _propertyConfigRepo.FirstOrDefaultAsync(x => x.Name == src.Name && x.EntityConfigRevision == revision)
                    ?? new EntityProperty { 
                        EntityConfigRevision = revision,
                        Name = src.Name,
                        DataType = src.DataType
                    };

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

        public override Task<EntityConfig> CopyAsync(EntityConfig item, CopyItemInput input)
        {
            throw new NotImplementedException();
        }

        public override Task<IConfigurationItemDto> MapToDtoAsync(EntityConfig item)
        {
            throw new NotImplementedException();
        }

        public override Task<EntityConfig> ExposeAsync(EntityConfig item, Module module)
        {
            throw new NotImplementedException();
        }

        public override Task<EntityConfig> CreateItemAsync(CreateItemInput input)
        {
            throw new NotImplementedException();
        }

        public override Task<EntityConfig> DuplicateAsync(EntityConfig item)
        {
            throw new NotImplementedException();
        }
    }
}
