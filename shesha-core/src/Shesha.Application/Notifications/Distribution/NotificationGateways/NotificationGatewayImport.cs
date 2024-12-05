using Abp.Dependency;
using Abp.Domain.Repositories;
using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.EntityReferences;
using Shesha.Services;
using Shesha.Services.ConfigurationItems;
using System;
using System.IO;
using System.Threading.Tasks;
using Shesha.Notifications.Distribution.NotificationTypes.Dto;
using Shesha.Notifications.Distribution.NotificationGateways.Dto;

namespace Shesha.Notifications.Distribution.NotificationGateways
{
    /// <summary>
    /// file template import
    /// </summary>
    public class NotificationGatewayImport : ConfigurationItemImportBase, INotificationGatewayImport, ITransientDependency
    {
        public readonly IRepository<NotificationGatewayConfig, Guid> _configurationRepo;
        public readonly IRepository<NotificationChannelConfig, Guid> _channelConfigurationRepo;

        public NotificationGatewayImport(
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IRepository<NotificationGatewayConfig, Guid> configurationRepo,
            IRepository<NotificationChannelConfig, Guid> channelConfigurationRepo
        ) : base (moduleRepo, frontEndAppRepo)
        {
            _configurationRepo = configurationRepo;
            _channelConfigurationRepo = channelConfigurationRepo;
        }

        public string ItemType => NotificationGatewayConfig.ItemTypeName;

        public async Task<ConfigurationItemBase> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!(item is DistributedNotificationGateway itemConfig))
                throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(NotificationGatewayConfig)}. Actual type is {item.GetType().FullName}");

            return await ImportAsync(itemConfig, context);
        }

        protected async Task<ConfigurationItemBase> ImportAsync(DistributedNotificationGateway item, IConfigurationItemsImportContext context)
        {
            // use status specified in the context with fallback to imported value
            var statusToImport = context.ImportStatusAs ?? item.VersionStatus;

            // get DB config
            var dbItem = await _configurationRepo.FirstOrDefaultAsync(x => x.Name == item.Name && x.Description == item.Description
                                                                                && (x.Module == null && item.ModuleName == null || x.Module != null && x.Module.Name == item.ModuleName)
                                                                                && x.IsLast);

            if (dbItem != null)
            {

                // ToDo: Temporary update the current version.
                // Need to update the rest of the other code to work with versioning first

                await MapConfigAsync(item, dbItem, context);
                await _configurationRepo.UpdateAsync(dbItem);
            }
            else
            {
                dbItem = new NotificationGatewayConfig();
                await MapConfigAsync(item, dbItem, context);

                // fill audit?
                dbItem.VersionNo = 1;
                dbItem.Module = await GetModuleAsync(item.ModuleName, context);

                // important: set status according to the context
                dbItem.VersionStatus = statusToImport;
                dbItem.CreatedByImport = context.ImportResult;

                dbItem.Normalize();
                await _configurationRepo.InsertAsync(dbItem);
            }
            return dbItem;
        }


        protected async Task<NotificationGatewayConfig> MapConfigAsync(DistributedNotificationGateway item, NotificationGatewayConfig dbItem, IConfigurationItemsImportContext context)
        {
            dbItem.Name = item.Name;
            dbItem.Module = await GetModuleAsync(item.ModuleName, context);
            dbItem.Application = await GetFrontEndAppAsync(item.FrontEndApplication, context);
            dbItem.ItemType = item.ItemType;

            dbItem.Label = item.Label;
            dbItem.Description = item.Description;
            dbItem.VersionNo = item.VersionNo;
            dbItem.VersionStatus = item.VersionStatus;
            dbItem.Suppress = item.Suppress;

            // entity specific properties
            dbItem.PartOf = await _channelConfigurationRepo.FirstOrDefaultAsync(x => x.Id == item.PartOfId);
            dbItem.GatewayTypeName = item.GatewayTypeName;

            return dbItem;
        }

        public async Task<DistributedConfigurableItemBase> ReadFromJsonAsync(Stream jsonStream)
        {
            using (var reader = new StreamReader(jsonStream))
            {
                var json = await reader.ReadToEndAsync();
                
                var result = !string.IsNullOrWhiteSpace(json)
                    ? JsonConvert.DeserializeObject<DistributedNotificationGateway>(json)
                    : null;
                
                if (result == null)
                    throw new Exception($"Failed to read {nameof(NotificationGatewayConfig)} from json");

                return result;
            }
        }
    }
}
