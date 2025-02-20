using Shesha.Email.Dtos;
using System.Collections.Generic;

namespace Shesha.Notifications.Dto
{
    public class NotificationMessageDto
    {
        public string Subject { get; set; }
        public string Message { get; set; }
        public List<EmailAttachment> Attachments { get; set; }
    }
}
