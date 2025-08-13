using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.Domain;
using Shesha.Notifications.Distribution.NotificationChannels.Dto;
using Shesha.Services.ConfigurationItems;
using System;
using System.Threading.Tasks;

namespace Shesha.Notifications.Distribution.NotificationChannels
{
    /// <summary>
    /// file template import
    /// </summary>
    public class NotificationChannelImport : ConfigurationItemImportBase<NotificationChannelConfig, NotificationChannelConfigRevision, DistributedNotificationChannel>, INotificationChannelImport, ITransientDependency
    {
        public NotificationChannelImport(
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IRepository<NotificationChannelConfig, Guid> repository,
            IRepository<NotificationChannelConfigRevision, Guid> revisionRepository
        ) : base (repository, revisionRepository, moduleRepo, frontEndAppRepo)
        {
        }

        public string ItemType => NotificationChannelConfig.ItemTypeName;

        protected override Task<bool> CustomPropsAreEqualAsync(NotificationChannelConfig item, NotificationChannelConfigRevision revision, DistributedNotificationChannel distributedItem)
        {
            var result = revision.SupportedFormat == distributedItem.SupportedFormat &&
                revision.MaxMessageSize == distributedItem.MaxMessageSize &&
                revision.SupportedMechanism == distributedItem.SupportedMechanism &&
                revision.SenderTypeName == distributedItem.SenderTypeName &&
                revision.DefaultPriority == distributedItem.DefaultPriority &&
                revision.Status == distributedItem.Status;

            return Task.FromResult(result);
        }

        protected override Task MapCustomPropsToItemAsync(NotificationChannelConfig item, NotificationChannelConfigRevision revision, DistributedNotificationChannel distributedItem)
        {
            revision.SupportedFormat = distributedItem.SupportedFormat;
            revision.MaxMessageSize = distributedItem.MaxMessageSize;
            revision.SupportedMechanism = distributedItem.SupportedMechanism;
            revision.SenderTypeName = distributedItem.SenderTypeName;
            revision.DefaultPriority = distributedItem.DefaultPriority;
            revision.Status = distributedItem.Status;

            return Task.CompletedTask;
        }
    }
}