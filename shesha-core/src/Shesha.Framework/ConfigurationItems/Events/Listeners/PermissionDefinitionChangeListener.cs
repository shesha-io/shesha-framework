using Abp.Dependency;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Shesha.Domain;

namespace Shesha.ConfigurationItems.Events.Listeners
{
    /// <summary>
    /// Listener for <see cref="PermissionDefinition"/> changes
    /// Detects changes and adds them to the configuration changes collector (<see cref="IConfigurationChangesCollector"/>)
    /// </summary>
    public class PermissionDefinitionChangeListener : IEventHandler<EntityChangingEventData<PermissionDefinition>>, ITransientDependency
    {
        private readonly IConfigurationChangesCollector _configurationChangesCollector;

        public PermissionDefinitionChangeListener(IConfigurationChangesCollector configurationChangesCollector)
        {
            _configurationChangesCollector = configurationChangesCollector;
        }

        public void HandleEvent(EntityChangingEventData<PermissionDefinition> eventData)
        {
            _configurationChangesCollector.AddUpdate(eventData.Entity);
        }
    }
}
