using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Notifications.Distribution.NotificationTypes.Dto;
using Shesha.Services.ConfigurationItems;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Notifications.Distribution.NotificationTypes
{
    /// <summary>
    /// file template import
    /// </summary>
    public class NotificationTypeImport : ConfigurationItemImportBase<NotificationTypeConfig, DistributedNotificationType>, INotificationTypeImport, ITransientDependency
    {
        private readonly INotificationManager _manager;
        private readonly IRepository<NotificationTemplate, Guid> _templateRepo;

        public NotificationTypeImport(
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IRepository<NotificationTypeConfig, Guid> repository,
            IRepository<NotificationTemplate, Guid> templateRepo,
            INotificationManager manager            
        ) : base (repository, moduleRepo, frontEndAppRepo)
        {
            _templateRepo = templateRepo;
            _manager = manager;           
        }

        public string ItemType => NotificationTypeConfig.ItemTypeName;

        protected override async Task AfterImportAsync(NotificationTypeConfig item, DistributedNotificationType distributedItem, IConfigurationItemsImportContext context)
        {
            await ImportTemplatesAsync(item, distributedItem.Templates);
        }

        private async Task ImportTemplatesAsync(NotificationTypeConfig item, List<DistributedNotificationTemplateDto> templates)
        {
            foreach (var templateDto in templates) 
            {
                var template = new NotificationTemplate { PartOf = item }.CopyTemplatePropsFrom(templateDto);
                await _templateRepo.InsertAsync(template);
            }
        }

        protected override async Task<bool> CustomPropsAreEqualAsync(NotificationTypeConfig item, DistributedNotificationType distributedItem)
        {
            var equals = item.IsTimeSensitive == distributedItem.IsTimeSensitive &&
                item.AllowAttachments == distributedItem.AllowAttachments &&
                item.Disable == distributedItem.Disable &&
                item.CanOptOut == distributedItem.CanOptOut &&
                item.Category == distributedItem.Category &&
                item.OverrideChannels == distributedItem.OverrideChannels;

            if (!equals)
                return false;

            // compare templates
            var templates = await _templateRepo.GetAll().Where(e => e.PartOf == item).ToListAsync();
            if (templates.Count() != distributedItem.Templates.Count)
                return false;

            foreach (var template in templates) 
            {
                if (distributedItem.Templates.Any(dt => dt.TitleTemplate == template.TitleTemplate &&
                    dt.BodyTemplate == template.BodyTemplate &&
                    dt.MessageFormat == template.MessageFormat))
                    return false;
            }
            return true;
        }

        protected override Task MapCustomPropsToItemAsync(NotificationTypeConfig item, DistributedNotificationType distributedItem)
        {
            // entity specific properties
            item.CopyNotificationSpecificPropsFrom(distributedItem);

            return Task.CompletedTask;
        }
    }
}