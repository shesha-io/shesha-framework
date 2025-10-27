using Abp.Dependency;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Shesha.Domain;

namespace Shesha.ConfigurationItems.Events
{
    /// <summary>
    /// Listener for <see cref="NotificationChannelConfig"/> changes
    /// Detects changes and adds them to the configuration changes collector (<see cref="IConfigurationChangesCollector"/>)
    /// </summary>
    public class NotificationChannelConfigChangeListener : IEventHandler<EntityChangingEventData<NotificationChannelConfig>>, ITransientDependency
    {
        private readonly IConfigurationChangesCollector _configurationChangesCollector;

        public NotificationChannelConfigChangeListener(IConfigurationChangesCollector configurationChangesCollector)
        {
            _configurationChangesCollector = configurationChangesCollector;
        }

        public void HandleEvent(EntityChangingEventData<NotificationChannelConfig> eventData)
        {
            _configurationChangesCollector.AddUpdate(eventData.Entity);
        }
    }
}
