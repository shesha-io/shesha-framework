using Shesha.Email.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.OmoNotifications.Dto
{
    public class NotificationMessageDto
    {
        public string Subject { get; set; }
        public string Message { get; set; }
        public List<EmailAttachment> Attachments { get; set; }
    }
}
