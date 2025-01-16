using Abp.Notifications;
using Shesha.Domain;
using Shesha.EntityReferences;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications.Dto
{
    public class NotificationDto
    {
        public NotificationTypeConfig type { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public NotificationChannelConfig channel { get; set; } = null;
        /// <summary>
        /// 
        /// </summary>
        public long priority { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public Person recipient { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public GenericEntityReference triggeringEntity { get; set; } = null;
    }

    public class BulkNotificationDto
    {
        public NotificationTypeConfig type { get; set; }
        /// <summary>
        /// 
        /// </summary>

        public NotificationChannelConfig channel { get; set; } = null;
        /// <summary>
        /// 
        /// </summary>
        public long priority { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public List<Person> recipients { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public GenericEntityReference triggeringEntity { get; set; } = null;
    }

    public class TestData : NotificationData
    {
        public string subject { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public string name { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public string body { get; set; }
    }
}
