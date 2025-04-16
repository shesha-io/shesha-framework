using Abp.Notifications;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.EntityReferences;
using Shesha.Notifications.Dto;
using Shesha.Notifications.MessageParticipants;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Notifications
{
    public interface INotificationSender
    {
        Task SendNotificationAsync<TData>(NotificationTypeConfig type, 
            IMessageSender? sender, 
            IMessageReceiver receiver, 
            TData data, 
            RefListNotificationPriority priority, 
            List<NotificationAttachmentDto>? attachments = null,
            string? cc = null,
            GenericEntityReference? triggeringEntity = null, 
            NotificationChannelConfig? channel = null,
            string? category = null) where TData : NotificationData;

        Task SendNotificationAsync<TData>(NotificationTypeConfig type,
            Person? sender,
            Person receiver,
            TData data,
            RefListNotificationPriority priority,
            List<NotificationAttachmentDto>? attachments = null,
            string? cc = null,
            GenericEntityReference? triggeringEntity = null,
            NotificationChannelConfig? channel = null,
            string? category = null) where TData : NotificationData;
    }
}
