using Shesha.Domain;
using Shesha.Notifications.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.OmoNotifications.Dto
{
    public class DirectNotificationJobArgs
    {
        public Guid FromPerson { get; set; }
        public Guid ToPerson { get; set; }
        public Guid Message { get; set; }
        public bool HtmlSupport { get; set; }
        public string SenderTypeName { get; set; }
    }
}
