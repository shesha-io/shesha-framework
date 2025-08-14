using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Notifications.Distribution.NotificationTypes.Dto;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Notifications.Distribution.NotificationTypes
{
    /// <summary>
    /// file template import
    /// </summary>
    public class NotificationTypeExport : ConfigurableItemExportBase<NotificationTypeConfig, NotificationTypeConfigRevision, DistributedNotificationType>, INotificationTypeExport, ITransientDependency
    {
        private readonly IRepository<NotificationTemplate, Guid> _templateRepo;

        public NotificationTypeExport(IRepository<NotificationTemplate, Guid> templateRepo)
        {
            _templateRepo = templateRepo;
        }

        public string ItemType => NotificationTypeConfig.ItemTypeName;

        public override async Task<DistributedNotificationType> ExportAsync(NotificationTypeConfig item)
        {
            var revision = item.Revision;

            var result = new DistributedNotificationType
            {
                Id = item.Id,
                Name = item.Name,
                ModuleName = item.Module?.Name,
                FrontEndApplication = item.Application?.AppKey,
                ItemType = item.ItemType,

                Label = revision.Label,
                Description = revision.Description,
                OriginId = item.Origin?.Id,
                Suppress = item.Suppress,
            };
            result.CopyNotificationSpecificPropsFrom(revision);
            result.Templates = await ExportTemplatesAsync(item);

            return await Task.FromResult(result);
        }

        private Task<List<DistributedNotificationTemplateDto>> ExportTemplatesAsync(NotificationTypeConfig notification)
        {
            throw new NotImplementedException();
            /*
            var templates = await _templateRepo.GetAll().Where(t => t.PartOf == notification).ToListAsync();
            return templates.Select(e => new DistributedNotificationTemplateDto { Id = e.Id }.CopyTemplatePropsFrom(e)).ToList();
            */
        }
    }
}