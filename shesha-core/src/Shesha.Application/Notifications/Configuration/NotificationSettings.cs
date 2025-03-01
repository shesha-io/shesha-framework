using Shesha.Domain;
using System.Collections.Generic;

namespace Shesha.Notifications.Configuration
{
    /// <summary>
    /// Enter preferred channels per priority.
    /// </summary>
    public class NotificationSettings
    {
        /// <summary>
        /// Low priority notifications channels
        /// </summary>
        public List<NotificationChannelIdentifier> Low { get; set; }

        /// <summary>
        /// Normal notifications channels
        /// </summary>
        public List<NotificationChannelIdentifier> Medium { get; set; }

        /// <summary>
        /// Urgent notifications channels
        /// </summary>
        public List<NotificationChannelIdentifier> High { get; set; }

        public NotificationChannelIdentifier Test { get; set; }
    }
}
