using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Runtime.Session;
using Abp.Timing;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Configuration.Runtime
{
    /// inheritedDoc
    public class EntityConfigManager : IEventHandler<EntityUpdatingEventData<EntityConfig>>, IEntityConfigManager, ITransientDependency
    {
        private readonly IRepository<ConfigurationItem, Guid> _configurationItemRepository;
        private readonly IRepository<EntityConfig, Guid> _repository;
        public IAbpSession AbpSession { get; set; } = NullAbpSession.Instance;

        public EntityConfigManager(
            IRepository<ConfigurationItem, Guid> configurationItemRepository,
            IRepository<EntityConfig, Guid> repository
            )
        {
            _configurationItemRepository = configurationItemRepository;
            _repository = repository;
        }

        public async Task<List<EntityConfigDto>> GetMainDataListAsync(IQueryable<EntityConfig> query = null, bool? implemented = null)
        {
            // Do not change to Mapper to avoid performance issues
            var result = await (query ?? _repository.GetAll())
                .Where(x => !x.Configuration.IsDeleted)
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
                    Suppress = x.Configuration.Suppress,
                    Module = x.Configuration.Module.Name,
                    Name = x.Configuration.Name,
                    Label = x.Configuration.Label
                }).ToListAsync();
            return implemented ?? false
                ? result.Where(x => !x.NotImplemented).ToList()
                : result;
        }

        public void HandleEvent(EntityUpdatingEventData<EntityConfig> eventData)
        {
            /*if (eventData.Entity.Configuration != null)
            {
                eventData.Entity.Configuration.LastModificationTime = Clock.Now;
                eventData.Entity.Configuration.LastModifierUserId = AbpSession?.UserId;
                _configurationItemRepository.InsertOrUpdate(eventData.Entity.Configuration);
            }*/
        }
    }
}
