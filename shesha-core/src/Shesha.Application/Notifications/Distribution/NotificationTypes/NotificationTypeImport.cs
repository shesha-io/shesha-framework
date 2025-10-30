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
            var dbTemplates = await _templateRepo.GetAll().Where(e => e.PartOf == item).ToListAsync();

            foreach (var templateDto in templates) 
            {
                var dbTemplate = dbTemplates.FirstOrDefault(dbt => dbt.TitleTemplate == templateDto.TitleTemplate &&
                    dbt.BodyTemplate == templateDto.BodyTemplate &&
                    dbt.MessageFormat == templateDto.MessageFormat);
                if (dbTemplate != null)
                {
                    // template exists - remove from the list to keep only the ones that need to be deleted
                    dbTemplates.Remove(dbTemplate);
                }
                else 
                {
                    // template is missing - create
                    var template = new NotificationTemplate { PartOf = item }.CopyTemplatePropsFrom(templateDto);
                    await _templateRepo.InsertAsync(template);
                }                    
            }

            // remove templates that need to be deleted
            foreach (var dbTemplate in dbTemplates)
            {
                await _templateRepo.DeleteAsync(dbTemplate);
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
            var dbTemplates = await _templateRepo.GetAll().Where(e => e.PartOf == item).ToListAsync();
            if (dbTemplates.Count() != distributedItem.Templates.Count)
                return false;

            var unprocessedTemplates = distributedItem.Templates.ToList();
            foreach (var dbTemplate in dbTemplates)
            {
                var template = unprocessedTemplates.FirstOrDefault(dt => dt.TitleTemplate == dbTemplate.TitleTemplate &&
                    dt.BodyTemplate == dbTemplate.BodyTemplate &&
                    dt.MessageFormat == dbTemplate.MessageFormat);
                if (template != null)
                    unprocessedTemplates.Remove(template);
                else
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