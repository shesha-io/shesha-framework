using Abp.Dependency;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Shesha.Domain;

namespace Shesha.ConfigurationItems.Events.Listeners
{
    /// <summary>
    /// Listener for <see cref="ReferenceList"/> changes
    /// Detects changes and adds them to the configuration changes collector (<see cref="IConfigurationChangesCollector"/>)
    /// </summary>
    public class RefListChangeListener : IEventHandler<EntityChangingEventData<ReferenceList>>,
        IEventHandler<EntityChangingEventData<ReferenceListItem>>,
        IEventHandler<EntityCreatingEventData<ReferenceListItem>>,
        IEventHandler<EntityDeletingEventData<ReferenceListItem>>,
        ITransientDependency
    {
        private readonly IConfigurationChangesCollector _configurationChangesCollector;

        public RefListChangeListener(IConfigurationChangesCollector configurationChangesCollector)
        {
            _configurationChangesCollector = configurationChangesCollector;
        }

        public void HandleEvent(EntityChangingEventData<ReferenceList> eventData)
        {
            _configurationChangesCollector.AddUpdate(eventData.Entity);
        }

        public void HandleEvent(EntityChangingEventData<ReferenceListItem> eventData)
        {
            if (eventData.Entity?.ReferenceList == null) return;
            _configurationChangesCollector.TryAddUpdate(eventData.Entity.ReferenceList);
        }

        public void HandleEvent(EntityCreatingEventData<ReferenceListItem> eventData)
        {
            if (eventData.Entity?.ReferenceList == null) return;
            _configurationChangesCollector.TryAddUpdate(eventData.Entity.ReferenceList);
        }

        public void HandleEvent(EntityDeletingEventData<ReferenceListItem> eventData)
        {
            if (eventData.Entity?.ReferenceList == null) return;
            _configurationChangesCollector.TryAddUpdate(eventData.Entity.ReferenceList);
        }
    }
}
