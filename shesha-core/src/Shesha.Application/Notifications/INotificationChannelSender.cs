using Shesha.Domain;
using Shesha.Email.Dtos;
using Shesha.Notifications.Dto;
using Shesha.Notifications.MessageParticipants;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Notifications
{
    public interface INotificationChannelSender
    {
        string? GetRecipientId(Person person);
        Task<SendStatus> SendAsync(IMessageSender? sender, IMessageReceiver receiver, NotificationMessage message, List<EmailAttachment>? attachments = null);
    }
}