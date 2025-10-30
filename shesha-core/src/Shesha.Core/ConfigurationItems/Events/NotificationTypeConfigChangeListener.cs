using Abp.Dependency;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Shesha.Domain;

namespace Shesha.ConfigurationItems.Events
{
    /// <summary>
    /// Listener for <see cref="NotificationTypeConfig"/> changes
    /// Detects changes and adds them to the configuration changes collector (<see cref="IConfigurationChangesCollector"/>)
    /// </summary>
    public class NotificationTypeConfigChangeListener : IEventHandler<EntityChangingEventData<NotificationTypeConfig>>,
        IEventHandler<EntityChangingEventData<NotificationTemplate>>,
        IEventHandler<EntityCreatingEventData<NotificationTemplate>>,
        IEventHandler<EntityDeletingEventData<NotificationTemplate>>,
        ITransientDependency
    {
        private readonly IConfigurationChangesCollector _configurationChangesCollector;

        public NotificationTypeConfigChangeListener(IConfigurationChangesCollector configurationChangesCollector)
        {
            _configurationChangesCollector = configurationChangesCollector;
        }

        public void HandleEvent(EntityChangingEventData<NotificationTypeConfig> eventData)
        {
            _configurationChangesCollector.AddUpdate(eventData.Entity);
        }

        public void HandleEvent(EntityChangingEventData<NotificationTemplate> eventData)
        {
            _configurationChangesCollector.TryAddUpdate(eventData.Entity.PartOf);
        }

        public void HandleEvent(EntityCreatingEventData<NotificationTemplate> eventData)
        {
            _configurationChangesCollector.TryAddUpdate(eventData.Entity.PartOf);
        }

        public void HandleEvent(EntityDeletingEventData<NotificationTemplate> eventData)
        {
            _configurationChangesCollector.TryAddUpdate(eventData.Entity.PartOf);
        }
    }
}
