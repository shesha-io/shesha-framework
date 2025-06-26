using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Notifications.Distribution.NotificationTypes.Dto;
using Shesha.Services.ConfigurationItems;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Notifications.Distribution.NotificationTypes
{
    /// <summary>
    /// file template import
    /// </summary>
    public class NotificationTypeImport : ConfigurationItemImportBase<NotificationTypeConfig, NotificationTypeConfigRevision, DistributedNotificationType>, INotificationTypeImport, ITransientDependency
    {
        private readonly INotificationManager _manager;
        private readonly IRepository<NotificationTemplate, Guid> _templateRepo;

        public NotificationTypeImport(
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IRepository<NotificationTypeConfig, Guid> repository,
            IRepository<NotificationTypeConfigRevision, Guid> revisionRepository,
            IRepository<NotificationTemplate, Guid> templateRepo,
            INotificationManager manager            
        ) : base (repository, revisionRepository, moduleRepo, frontEndAppRepo)
        {
            _templateRepo = templateRepo;
            _manager = manager;           
        }

        public string ItemType => NotificationTypeConfig.ItemTypeName;

        protected override async Task AfterImportAsync(NotificationTypeConfig item, NotificationTypeConfigRevision revision, DistributedNotificationType distributedItem, IConfigurationItemsImportContext context)
        {
            await ImportTemplatesAsync(item, revision, distributedItem.Templates);
        }

        private async Task ImportTemplatesAsync(NotificationTypeConfig item, NotificationTypeConfigRevision revision, List<DistributedNotificationTemplateDto> templates)
        {
            foreach (var templateDto in templates) 
            {
                var template = new NotificationTemplate { PartOf = revision }.CopyTemplatePropsFrom(templateDto);
                await _templateRepo.InsertAsync(template);
            }
        }

        protected override Task<bool> CustomPropsAreEqualAsync(NotificationTypeConfig item, NotificationTypeConfigRevision revision, DistributedNotificationType distributedItem)
        {
            var equals = revision.IsTimeSensitive == distributedItem.IsTimeSensitive &&
                revision.AllowAttachments == distributedItem.AllowAttachments &&
                revision.Disable == distributedItem.Disable &&
                revision.CanOptOut == distributedItem.CanOptOut &&
                revision.Category == distributedItem.Category &&
                revision.OrderIndex == distributedItem.OrderIndex &&
                revision.OverrideChannels == distributedItem.OverrideChannels;

            // TODO_V1: compare templates

            return Task.FromResult(equals);
        }

        protected override Task MapCustomPropsToItemAsync(NotificationTypeConfig item, NotificationTypeConfigRevision revision, DistributedNotificationType distributedItem)
        {
            // entity specific properties
            revision.CopyNotificationSpecificPropsFrom(distributedItem);

            return Task.CompletedTask;
        }
    }
}