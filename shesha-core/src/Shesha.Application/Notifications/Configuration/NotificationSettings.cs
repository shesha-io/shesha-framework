using Shesha.Configuration;
using Shesha.Domain;
using Shesha.Settings;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications.Configuration
{
    /// <summary>
    /// Enter preferred channels per priority.
    /// </summary>
    public class NotificationSettings
    {
        /// <summary>
        /// Urgent notifications
        /// </summary>
        public List<NotificationChannelConfig> Low { get; set; }

        /// <summary>
        /// Normal notifications
        /// </summary>
        public List<NotificationChannelConfig> Medium { get; set; }

        /// <summary>
        /// Informational notifications
        /// </summary>
        public List<NotificationChannelConfig> High { get; set; }
    }
}
