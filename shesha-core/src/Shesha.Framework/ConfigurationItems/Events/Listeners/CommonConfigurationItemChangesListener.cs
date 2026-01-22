using Abp.Dependency;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Shesha.Domain;

namespace Shesha.ConfigurationItems.Events.Listeners
{
    /// <summary>
    /// Common listener for <see cref="ConfigurationItem"/> changes
    /// Detects changes and adds them to the configuration changes collector (<see cref="IConfigurationChangesCollector"/>)
    /// </summary>
    public class CommonConfigurationItemChangesListener : IEventHandler<EntityChangingEventData<ConfigurationItem>>,
        IEventHandler<EntityCreatingEventData<ConfigurationItem>>,
        ITransientDependency
    {
        private readonly IConfigurationChangesCollector _configurationChangesCollector;

        public CommonConfigurationItemChangesListener(IConfigurationChangesCollector configurationChangesCollector)
        {
            _configurationChangesCollector = configurationChangesCollector;
        }

        public void HandleEvent(EntityChangingEventData<ConfigurationItem> eventData)
        {
            _configurationChangesCollector.AddUpdate(eventData.Entity);
        }

        public void HandleEvent(EntityCreatingEventData<ConfigurationItem> eventData)
        {
            _configurationChangesCollector.TryAddUpdate(eventData.Entity);
        }
    }
}
