using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Notifications.Distribution.NotificationTypes.Dto
{
    /// <summary>
    /// Distributed file template
    /// </summary>
    public class DistributedNotificationTypes: DistributedConfigurableItemBase
    {
        /// <summary>
        /// 
        /// </summary>
        public bool AllowAttachments { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public bool Disable { get; set; }
        /// <summary>
        /// If true indicates that users may opt out of this notification
        /// </summary>
        public bool CanOtpOut { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public string Category { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public int OrderIndex { get; set; }
        /// <summary>
        /// List of NotificationChannelConfigs
        /// </summary>
        [StringLength(int.MaxValue)]
        public string OverrideChannels { get; set; }
    }
}
