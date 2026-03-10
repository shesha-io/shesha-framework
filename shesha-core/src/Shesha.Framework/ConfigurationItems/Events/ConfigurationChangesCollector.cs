using Abp.Dependency;
using Abp.Domain.Uow;
using Abp.Events.Bus;
using Abp.Runtime.Session;
using Shesha.Domain;
using Shesha.Extensions;
using System.Collections.Generic;

namespace Shesha.ConfigurationItems.Events
{
    /// <summary>
    /// Configuration Item changes collector. Collects configurtation changes and triggers auto generation of revisions
    /// </summary>
    public class ConfigurationChangesCollector : IConfigurationChangesCollector, ITransientDependency
    {
        private const string ConfigUpdatesKey = "Shesha:ConfigUpdates";
        private readonly IUnitOfWorkManager _uowManager;
        private readonly IEventBus _eventBus;
        private readonly IConfigurationItemHelper _ciHelper;
        private readonly IConfigurationFrameworkRuntime _cfRuntime;
        

        public IAbpSession AbpSession { get; set; } = NullAbpSession.Instance;

        public ConfigurationChangesCollector(IUnitOfWorkManager uowManager, IEventBus eventBus, IConfigurationItemHelper ciHelper, IConfigurationFrameworkRuntime cfRuntime)
        {
            _uowManager = uowManager;
            _eventBus = eventBus;
            _ciHelper = ciHelper;
            _cfRuntime = cfRuntime;
        }

        /// <summary>
        /// Add configuration change
        /// </summary>
        public void AddUpdate(ConfigurationItemIdentifier identifier) 
        { 
            AddUpdate(identifier.ItemTypeName, identifier.Module ?? "", identifier.Name);
        }

        /// <summary>
        /// Add configuration change
        /// </summary>
        public void AddUpdate(string itemType, string module, string name)
        {
            if (!_cfRuntime.IsConfigurationTrackingEnabled)
                return;

            var uow = _uowManager.Current;
            if (uow == null)
                return;

            var updates = uow.GetOrAdd(ConfigUpdatesKey, () => {
                var eventData = new ConfigurationChangesCollectedEventData { Updates = new List<ConfigurationChangesCollectedEventData.ConfigIdentifier>() };
                uow.DoAfterTransaction(() =>
                {
                    _eventBus.Trigger(eventData);
                });

                return eventData.Updates;
            });


            updates.Add(new ConfigurationChangesCollectedEventData.ConfigIdentifier(itemType, module, name));
        }

        /// <summary>
        /// Add configuration change
        /// </summary>
        public void AddUpdate(ConfigurationItem configurationItem)
        {
            if (configurationItem.IsDeleted)
                return;

            var itemType = _ciHelper.GetDiscriminator(configurationItem.GetRealEntityType());

            AddUpdate(itemType, configurationItem.Module?.Name ?? string.Empty, configurationItem.Name);
        }

        /// <summary>
        /// Try add configuration change. Is used for simplification purposes. It calls <see cref="AddUpdate(ConfigurationItem)"/> when <see cref="ConfigurationItem"/> is not null.
        /// </summary>
        /// <param name="configurationItem"></param>
        public void TryAddUpdate(ConfigurationItem? configurationItem) 
        { 
            if (configurationItem is not null)
                AddUpdate(configurationItem);
        }
    }
}
