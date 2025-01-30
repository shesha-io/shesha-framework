using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Email.Dtos;
using Shesha.Notifications.Dto;
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
        string GetRecipientId(Person person, string identifier);
        Task<SendStatus> SendAsync(Person fromPerson, Person toPerson, string identifier, NotificationMessage message, string cc, List<EmailAttachment> attachments = null);
    }
}