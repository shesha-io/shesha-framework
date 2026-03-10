using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Json;
using System.Collections.Generic;

namespace Shesha.Notifications.Distribution.NotificationTypes.Dto
{
    /// <summary>
    /// Distributed file template
    /// </summary>
    public class DistributedNotificationType: DistributedConfigurableItemBase, INotificationTypeSpecificProps
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
        public bool CanOptOut { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public string Category { get; set; } = string.Empty;
        /// <summary>
        /// 
        /// </summary>
        public int OrderIndex { get; set; }
        /// <summary>
        /// List of NotificationChannelConfigs
        /// </summary>
        [JsonConverter(typeof(FlexibleCollectionConverter<ConfigurationItemIdentifierDto>))]
        public IList<ConfigurationItemIdentifierDto>? OverrideChannels { get; set; } = new List<ConfigurationItemIdentifierDto>();
        /// <summary>
        ///  messages without which the user should not proceed in any case e.g. OTP
        /// </summary>
        public bool IsTimeSensitive { get; set; }

        /// <summary>
        /// Templates
        /// </summary>
        public List<DistributedNotificationTemplateDto> Templates { get; set; } = new();
    }
}
