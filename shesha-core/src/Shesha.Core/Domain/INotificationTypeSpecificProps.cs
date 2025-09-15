using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    public interface INotificationTypeSpecificProps
    {
        /// <summary>
        /// If true, attachments are allowed for this notification
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
        public string Category { get; set; }

        /// <summary>
        /// List of NotificationChannelConfigs
        /// </summary>
        [MaxLength(int.MaxValue)]
        public string OverrideChannels { get; set; }

        /// <summary>
        ///  messages without which the user should not proceed in any case e.g. OTP
        /// </summary>
        public bool IsTimeSensitive { get; set; }
    }
}
