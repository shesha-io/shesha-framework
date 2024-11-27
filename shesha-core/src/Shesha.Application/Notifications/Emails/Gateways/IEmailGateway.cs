using Shesha.Domain;
using Shesha.Email.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications.Emails.Gateways
{
    public interface IEmailGateway
    {
        Task<bool> SendAsync(string fromPerson, string toPerson, NotificationMessage message, bool isBodyHtml, string cc = "", bool throwException = false, List<EmailAttachment> attachments = null);
        Task<bool> BroadcastAsync(string topicSubscribers, string subject, string message, List<EmailAttachment> attachments = null);
    }

}
