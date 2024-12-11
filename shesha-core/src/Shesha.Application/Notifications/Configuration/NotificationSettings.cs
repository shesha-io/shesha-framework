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
        /// Low priority notifications channels
        /// </summary>
        public List<string> Low { get; set; }

        /// <summary>
        /// Normal notifications channels
        /// </summary>
        public List<string> Medium { get; set; }

        /// <summary>
        /// Urgent notifications channels
        /// </summary>
        public List<string> High { get; set; }
    }
}
