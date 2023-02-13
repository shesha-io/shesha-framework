using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Push.Dtos
{
    /// <summary>
    /// Input for sending a push notification
    /// </summary>
    public abstract class SendNotificationInput
    {
        /// <summary>
        /// Notification body
        /// </summary>
        [Required]
        public string Body { get; set; }
        
        /// <summary>
        /// Notification title
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Additional data
        /// </summary>
        public Dictionary<string, string> Data { get; set; }
    }
}
