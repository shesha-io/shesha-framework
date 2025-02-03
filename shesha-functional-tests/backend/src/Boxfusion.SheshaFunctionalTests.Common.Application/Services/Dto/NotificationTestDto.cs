using Abp.Notifications;
using Shesha.Domain;
using Shesha.EntityReferences;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto
{
    public class NotificationDto
    {
        public NotificationTypeConfig Type { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public NotificationChannelConfig Channel { get; set; } = null;
        /// <summary>
        /// 
        /// </summary>
        public long Priority { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public Person Recipient { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public GenericEntityReference TriggeringEntity { get; set; } = null;
    }
}
