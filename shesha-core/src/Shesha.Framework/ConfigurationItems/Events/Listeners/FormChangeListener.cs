using Abp.Dependency;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Shesha.Domain;

namespace Shesha.ConfigurationItems.Events.Listeners
{
    /// <summary>
    /// Listener for <see cref="FormConfiguration"/> changes
    /// Detects changes and adds them to the configuration changes collector (<see cref="IConfigurationChangesCollector"/>)
    /// </summary>
    public class FormChangeListener : IEventHandler<EntityChangingEventData<FormConfiguration>>, ITransientDependency
    {
        private readonly IConfigurationChangesCollector _configurationChangesCollector;

        public FormChangeListener(IConfigurationChangesCollector configurationChangesCollector)
        {
            _configurationChangesCollector = configurationChangesCollector;
        }

        public void HandleEvent(EntityChangingEventData<FormConfiguration> eventData)
        {
            _configurationChangesCollector.AddUpdate(eventData.Entity);
        }
    }
}
