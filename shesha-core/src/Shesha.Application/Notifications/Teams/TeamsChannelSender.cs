using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Email.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications.Teams
{
    public class TeamsChannelSender : INotificationChannelSender
    {
        public string GetRecipientId(Person person)
        {
            // Logic to get Teams ID or use email
            return person.EmailAddress1;
        }

        public async Task<bool> SendAsync(Person fromPerson, Person toPerson, NotificationMessage message, bool isBodyHtml, string cc = "", bool throwException = false, List<EmailAttachment> attachments = null)
        {
            // Call Teams API to send message
            return await Task.FromResult(true); // Replace with actual API call
        }

        public async Task<bool> BroadcastAsync(NotificationTopic topic, string subject, string message, List<EmailAttachment> attachments = null)
        {
            return await Task.FromResult(false);
        }
    }

}
