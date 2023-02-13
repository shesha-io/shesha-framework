using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Abp.Runtime.Session;
using Abp.Timing;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using System;

namespace Shesha.Configuration.Runtime
{
    /// inheritedDoc
    public class EntityConfigManager : IEventHandler<EntityUpdatingEventData<EntityConfig>>, IEntityConfigManager, ITransientDependency
    {
        private readonly IRepository<ConfigurationItem, Guid> _configurationItemRepository;
        public IAbpSession AbpSession { get; set; } = NullAbpSession.Instance;

        public EntityConfigManager(IRepository<ConfigurationItem, Guid> configurationItemRepository)
        {
            _configurationItemRepository = configurationItemRepository;
        }

        public void HandleEvent(EntityUpdatingEventData<EntityConfig> eventData)
        {
            if (eventData.Entity.Configuration != null)
            {
                eventData.Entity.Configuration.LastModificationTime = Clock.Now;
                eventData.Entity.Configuration.LastModifierUserId = AbpSession?.UserId;
                _configurationItemRepository.InsertOrUpdate(eventData.Entity.Configuration);
            }
        }
    }
}
