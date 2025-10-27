using Abp.Dependency;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Shesha.Domain;

namespace Shesha.ConfigurationItems.Events
{
    /// <summary>
    /// Listener for <see cref="ShaRole"/> changes
    /// Detects changes and adds them to the configuration changes collector (<see cref="IConfigurationChangesCollector"/>)
    /// </summary>
    public class RoleConfigChangeListener : IEventHandler<EntityChangingEventData<ShaRole>>,
        IEventHandler<EntityChangingEventData<ShaRolePermission>>,
        IEventHandler<EntityCreatingEventData<ShaRolePermission>>,
        IEventHandler<EntityDeletingEventData<ShaRolePermission>>,
        ITransientDependency
    {
        private readonly IConfigurationChangesCollector _configurationChangesCollector;

        public RoleConfigChangeListener(IConfigurationChangesCollector configurationChangesCollector)
        {
            _configurationChangesCollector = configurationChangesCollector;
        }

        public void HandleEvent(EntityChangingEventData<ShaRole> eventData)
        {
            _configurationChangesCollector.AddUpdate(eventData.Entity);
        }

        public void HandleEvent(EntityChangingEventData<ShaRolePermission> eventData)
        {
            _configurationChangesCollector.TryAddUpdate(eventData.Entity.Role);
        }

        public void HandleEvent(EntityCreatingEventData<ShaRolePermission> eventData)
        {
            _configurationChangesCollector.TryAddUpdate(eventData.Entity.Role);
        }

        public void HandleEvent(EntityDeletingEventData<ShaRolePermission> eventData)
        {
            _configurationChangesCollector.TryAddUpdate(eventData.Entity.Role);
        }
    }
}
