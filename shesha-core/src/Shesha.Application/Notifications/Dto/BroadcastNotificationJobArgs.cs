using Abp.Notifications;
using Shesha.Domain;
using Shesha.Notifications.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications.Dto
{
    public class BroadcastNotificationJobArgs
    {
        public Guid NotificationId { get; set; }
        public Guid TemplateId { get; set; }
        public bool HtmlSupport { get; set; }
        public Guid ChannelId { get; set; }
        public string Subject { get; set; }
        public string Message { get; set; }
        public List<NotificationAttachmentDto> Attachments { get; set; }
    }
}
