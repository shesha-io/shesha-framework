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
    public class NotificationChannelImport : ConfigurationItemImportBase<NotificationChannelConfig, DistributedNotificationChannel>, INotificationChannelImport, ITransientDependency
    {
        public NotificationChannelImport(
            IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IRepository<NotificationChannelConfig, Guid> repository
        ) : base (repository, moduleRepo, frontEndAppRepo)
        {
        }

        public string ItemType => NotificationChannelConfig.ItemTypeName;

        protected override Task<bool> CustomPropsAreEqualAsync(NotificationChannelConfig item, DistributedNotificationChannel distributedItem)
        {
            var result = item.SupportedFormat == distributedItem.SupportedFormat &&
                item.MaxMessageSize == distributedItem.MaxMessageSize &&
                item.SupportedMechanism == distributedItem.SupportedMechanism &&
                item.SenderTypeName == distributedItem.SenderTypeName &&
                item.DefaultPriority == distributedItem.DefaultPriority &&
                item.Status == distributedItem.Status;

            return Task.FromResult(result);
        }

        protected override Task MapCustomPropsToItemAsync(NotificationChannelConfig item, DistributedNotificationChannel distributedItem)
        {
            item.SupportedFormat = distributedItem.SupportedFormat;
            item.MaxMessageSize = distributedItem.MaxMessageSize;
            item.SupportedMechanism = distributedItem.SupportedMechanism;
            item.SenderTypeName = distributedItem.SenderTypeName ?? string.Empty;
            item.DefaultPriority = distributedItem.DefaultPriority;
            item.Status = distributedItem.Status;

            return Task.CompletedTask;
        }
    }
}