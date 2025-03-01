using Abp.Dependency;
using Abp.Domain.Repositories;
using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Notifications.Distribution.NotificationTypes.Dto;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Notifications.Distribution.NotificationTypes
{
    /// <summary>
    /// file template import
    /// </summary>
    public class NotificationTypeExport : INotificationTypeExport, ITransientDependency
    {
        private readonly IRepository<NotificationTypeConfig, Guid> _configurationRepo;
        private readonly IRepository<NotificationTemplate, Guid> _templateRepo;

        public NotificationTypeExport(IRepository<NotificationTypeConfig, Guid> configurationRepo, IRepository<NotificationTemplate, Guid> templateRepo)
        {
            _configurationRepo = configurationRepo;
            _templateRepo = templateRepo;
        }

        public string ItemType => NotificationTypeConfig.ItemTypeName;

        public async Task<DistributedConfigurableItemBase> ExportItemAsync(Guid id)
        {
            var item = await _configurationRepo.GetAsync(id);
            return await ExportItemAsync(item);
        }

        public async Task<DistributedConfigurableItemBase> ExportItemAsync(ConfigurationItemBase item)
        {
            if (!(item is NotificationTypeConfig itemConfig))
                throw new ArgumentException($"Wrong type of argument {item}. Expected {nameof(NotificationTypeConfig)}, actual: {item.GetType().FullName}", nameof(item));

            var result = new DistributedNotificationType
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
            };
            result.CopyNotificationSpecificPropsFrom(itemConfig);
            result.Templates = await ExportTemplatesAsync(itemConfig);

            return await Task.FromResult<DistributedConfigurableItemBase>(result);
        }

        private async Task<List<DistributedNotificationTemplateDto>> ExportTemplatesAsync(NotificationTypeConfig notification)
        {
            var templates = await _templateRepo.GetAll().Where(t => t.PartOf == notification).ToListAsync();
            return templates.Select(e => new DistributedNotificationTemplateDto { Id = e.Id }.CopyTemplatePropsFrom(e)).ToList();
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
