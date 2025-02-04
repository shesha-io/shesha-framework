using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Email.Dtos;
using Shesha.Notifications.Dto;
using Shesha.Notifications.MessageParticipants;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications
{
    public interface INotificationChannelSender
    {
        string GetRecipientId(Person person);
        Task<SendStatus> SendAsync(IMessageSender fromPerson, IMessageReciever toPerson, NotificationMessage message, string cc, List<EmailAttachment> attachments = null);
    }
}