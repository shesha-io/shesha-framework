using Abp.Dependency;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Shesha.Domain;

namespace Shesha.ConfigurationItems.Events.Listeners
{
    /// <summary>
    /// Listener for <see cref="SettingConfiguration"/> changes
    /// Detects changes and adds them to the configuration changes collector (<see cref="IConfigurationChangesCollector"/>)
    /// </summary>
    public class SettingConfigurationChangeListener : IEventHandler<EntityChangingEventData<SettingConfiguration>>, ITransientDependency
    {
        private readonly IConfigurationChangesCollector _configurationChangesCollector;

        public SettingConfigurationChangeListener(IConfigurationChangesCollector configurationChangesCollector)
        {
            _configurationChangesCollector = configurationChangesCollector;
        }

        public void HandleEvent(EntityChangingEventData<SettingConfiguration> eventData)
        {
            _configurationChangesCollector.AddUpdate(eventData.Entity);
        }
    }
}
