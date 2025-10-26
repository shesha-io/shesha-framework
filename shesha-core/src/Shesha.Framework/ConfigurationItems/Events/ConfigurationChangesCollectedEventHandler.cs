using Abp.Dependency;
using Abp.Domain.Uow;
using Abp.Events.Bus.Handlers;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions;

namespace Shesha.ConfigurationItems.Events
{
    /// <summary>
    /// Handler of the configuration changes collected event. Saves new revisions of configuration to the database
    /// </summary>
    public class ConfigurationChangesCollectedEventHandler : IAsyncEventHandler<ConfigurationChangesCollectedEventData>, ITransientDependency
    {
        private readonly IConfigurationFrameworkRuntime _cfRuntime;
        private readonly IConfigurationItemHelper _ciHelper;
        private readonly IUnitOfWorkManager _uowManager;        

        public ConfigurationChangesCollectedEventHandler(IConfigurationFrameworkRuntime cfRuntime, IConfigurationItemHelper ciHelper, IUnitOfWorkManager uowManager)
        {
            _cfRuntime = cfRuntime;
            _ciHelper = ciHelper;
            _uowManager = uowManager;
        }

        public async Task HandleEventAsync(ConfigurationChangesCollectedEventData eventData)
        {
            var updates = eventData.Updates.Distinct(new ConfigIdentifierComparer()).ToList();

            if (!updates.Any())
                return;

            using (_cfRuntime.DisableConfigurationTracking()) 
            {
                using (var uow = _uowManager.Begin(TransactionScopeOption.RequiresNew))
                {
                    foreach (var update in updates)
                    {
                        var manager = _ciHelper.GetManager(update.ItemType);

                        var item = await manager.GetAsync(update.Module, update.Name);

                        await manager.SaveToRevisionAsync(item);
                    }
                    await uow.CompleteAsync();
                }
            }
        }
    }
}
