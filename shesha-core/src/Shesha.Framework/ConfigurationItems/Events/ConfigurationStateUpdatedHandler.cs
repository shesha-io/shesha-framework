using Abp.Dependency;
using Abp.Events.Bus.Handlers;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems.Events
{

    public class ConfigurationStateUpdatedHandler : IAsyncEventHandler<ConfigurationStateUpdatedEventData>, ITransientDependency
    {
        private readonly IConfigurationItemHelper _ciHelper;
        private readonly IIocResolver _iocResolver;

        public ConfigurationStateUpdatedHandler(IIocResolver iocResolver, IConfigurationItemHelper ciHelper)
        {
            _iocResolver = iocResolver;
            _ciHelper = ciHelper;
        }

        public async Task HandleEventAsync(ConfigurationStateUpdatedEventData eventData)
        {
            var manager = _ciHelper.GetManagerByDiscriminator(eventData.ConfigurationType);
            
            var item = await manager.GetAsync(eventData.ModuleName, eventData.ItemName);

            await manager.SaveToRevisionAsync(item);
        }
    }
}
