using Abp.Dependency;
using Abp.Events.Bus.Handlers;
using Shesha.ConfigurationItems.Distribution.Exceptions;
using System;
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
            var manager = _ciHelper.GetManager(eventData.ConfigurationType);
            
            var item = await manager.GetAsync(eventData.ModuleName, eventData.ItemName);

            await manager.SaveToRevisionAsync(item);
            /*
            var exporter = _iocResolver.GetItemExporter(manager.ItemType);
            if (exporter == null)
                throw new ExporterNotFoundException(eventData.ConfigurationType);

            var item = await manager.GetAsync(eventData.ModuleName, eventData.ItemName);

            var json = await exporter.ExportItemToJsonAsync(item);

            var revision = item.MakeNewRevision();
            revision.ConfigurationJson = json;

            await manager.SaveRevisionAsync(revision);
            */
            // TODO: save json to revision
        }
    }
}
