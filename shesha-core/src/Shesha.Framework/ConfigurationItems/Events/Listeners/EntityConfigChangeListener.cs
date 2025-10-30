using Abp.Dependency;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Shesha.Domain;

namespace Shesha.ConfigurationItems.Events.Listeners
{
    /// <summary>
    /// Listener for <see cref="EntityConfig"/> changes
    /// Detects changes and adds them to the configuration changes collector (<see cref="IConfigurationChangesCollector"/>)
    /// </summary>
    public class EntityConfigChangeListener : IEventHandler<EntityChangingEventData<EntityConfig>>,
        IEventHandler<EntityChangingEventData<EntityProperty>>,
        IEventHandler<EntityCreatingEventData<EntityProperty>>,
        IEventHandler<EntityDeletingEventData<EntityProperty>>,
        ITransientDependency
    {
        private readonly IConfigurationChangesCollector _configurationChangesCollector;

        public EntityConfigChangeListener(IConfigurationChangesCollector configurationChangesCollector)
        {
            _configurationChangesCollector = configurationChangesCollector;
        }

        public void HandleEvent(EntityChangingEventData<EntityConfig> eventData)
        {
            _configurationChangesCollector.AddUpdate(eventData.Entity);
        }

        public void HandleEvent(EntityChangingEventData<EntityProperty> eventData)
        {
            _configurationChangesCollector.TryAddUpdate(eventData.Entity.EntityConfig);
        }

        public void HandleEvent(EntityCreatingEventData<EntityProperty> eventData)
        {
            _configurationChangesCollector.TryAddUpdate(eventData.Entity.EntityConfig);
        }

        public void HandleEvent(EntityDeletingEventData<EntityProperty> eventData)
        {
            _configurationChangesCollector.TryAddUpdate(eventData.Entity.EntityConfig);
        }
    }
}
