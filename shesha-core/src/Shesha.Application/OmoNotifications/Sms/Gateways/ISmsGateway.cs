using Shesha.Domain;
using Shesha.Email.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.OmoNotifications.Sms.Gateways
{
    public interface ISmsGateway
    {
        Task<bool> SendAsync(string fromPerson, string message);
        Task<bool> BroadcastAsync(string topicSubscribers, string subject, string message, List<EmailAttachment> attachments = null);
    }
}
