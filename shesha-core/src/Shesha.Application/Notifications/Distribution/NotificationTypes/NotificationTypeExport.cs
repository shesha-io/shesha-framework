using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Notifications.Distribution.NotificationTypes.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Notifications.Distribution.NotificationTypes
{
    /// <summary>
    /// file template import
    /// </summary>
    public class NotificationTypeExport : ConfigurableItemExportBase<NotificationTypeConfig, DistributedNotificationType>, INotificationTypeExport, ITransientDependency
    {
        private readonly IRepository<NotificationTemplate, Guid> _templateRepo;

        public NotificationTypeExport(IRepository<NotificationTemplate, Guid> templateRepo)
        {
            _templateRepo = templateRepo;
        }

        public string ItemType => NotificationTypeConfig.ItemTypeName;

        protected override async Task MapCustomPropsAsync(NotificationTypeConfig item, DistributedNotificationType result)
        {
            result.CopyNotificationSpecificPropsFrom(item);
            result.Templates = await ExportTemplatesAsync(item);
        }

        private async Task<List<DistributedNotificationTemplateDto>> ExportTemplatesAsync(NotificationTypeConfig item)
        {
            var templates = await _templateRepo.GetAll().Where(t => t.PartOf == item).ToListAsync();
            return templates.Select(e => new DistributedNotificationTemplateDto { Id = e.Id }.CopyTemplatePropsFrom(e)).ToList();
        }
    }
}