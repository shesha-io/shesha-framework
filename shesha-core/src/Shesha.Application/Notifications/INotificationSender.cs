using Shesha.Domain;
using Shesha.Email.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications
{
    public interface INotificationSender
    {
        Task SendAsync(Person fromPerson, Person toPerson, NotificationMessage message, INotificationChannelSender notificationChannelSender);
        Task SendBroadcastAsync(Notification notification, string subject, string messageContent, List<EmailAttachment> attachments, INotificationChannelSender notificationChannelSender);
    }
}
