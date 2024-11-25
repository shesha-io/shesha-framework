using Shesha.Configuration;
using Shesha.Domain;
using Shesha.Settings;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.OmoNotifications.Configuration.Sms
{
    public class SmsSettings
    {
        /// <summary>
        /// If true, all Sms are enabled
        /// </summary>
        public bool SmsEnabled { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public NotificationGatewayConfig PreferredGateway { get; set; }

        /// <summary>
        /// Redirect all messages to.
        /// Is used for testing purposes only
        /// </summary>
        public string RedirectAllMessagesTo { get; set; }
    }
}
