using Abp.Dependency;
using Abp.Domain.Repositories;
using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Notifications.Distribution.NotificationGateways.Dto;
using Shesha.Notifications.Distribution.NotificationTypes.Dto;
using Shesha.Services;
using Shesha.StoredFiles;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.Notifications.Distribution.NotificationGateways
{
    /// <summary>
    /// file template import
    /// </summary>
    public class NotificationGatewayExport : INotificationGatewayExport, ITransientDependency
    {
        private readonly IRepository<NotificationGatewayConfig, Guid> _configurationRepo;

        public NotificationGatewayExport(IRepository<NotificationGatewayConfig, Guid> configurationRepo)
        {
            _configurationRepo = configurationRepo;
        }

        public string ItemType => NotificationGatewayConfig.ItemTypeName;

        public async Task<DistributedConfigurableItemBase> ExportItemAsync(Guid id)
        {
            var item = await _configurationRepo.GetAsync(id);
            return await ExportItemAsync(item);
        }

        public async Task<DistributedConfigurableItemBase> ExportItemAsync(ConfigurationItemBase item)
        {
            if (!(item is NotificationGatewayConfig itemConfig))
                throw new ArgumentException($"Wrong type of argument {item}. Expected {nameof(NotificationGatewayConfig)}, actual: {item.GetType().FullName}", nameof(item));

            var result = new DistributedNotificationGateway
            {
                Id = itemConfig.Id,
                Name = itemConfig.Name,
                ModuleName = itemConfig.Module?.Name,
                FrontEndApplication = itemConfig.Application?.AppKey,
                ItemType = itemConfig.ItemType,

                Label = itemConfig.Label,
                Description = itemConfig.Description,
                OriginId = itemConfig.Origin?.Id,
                BaseItem = itemConfig.BaseItem?.Id,
                VersionNo = itemConfig.VersionNo,
                VersionStatus = itemConfig.VersionStatus,
                ParentVersionId = itemConfig.ParentVersion?.Id,
                Suppress = itemConfig.Suppress,

                // specific properties
                PartOfId = itemConfig.PartOf.Id,
                GatewayTypeName = itemConfig.GatewayTypeName
            };

            return await Task.FromResult<DistributedConfigurableItemBase>(result);
        }

        /// inheritedDoc
        public async Task WriteToJsonAsync(DistributedConfigurableItemBase item, Stream jsonStream)
        {
            var json = JsonConvert.SerializeObject(item, Formatting.Indented);
            using (var writer = new StreamWriter(jsonStream))
            {
                await writer.WriteAsync(json);
            }
        }
    }
}
