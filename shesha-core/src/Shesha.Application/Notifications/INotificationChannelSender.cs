using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Email.Dtos;
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
        Task<Tuple<bool, string>> SendAsync(Person fromPerson, Person toPerson, NotificationMessage message, bool isBodyHtml, string cc, List<EmailAttachment> attachments = null);
        Task<Tuple<bool, string>> BroadcastAsync(NotificationTopic topic, string subject, string message, List<EmailAttachment> attachments = null);
    }
}