using System.ComponentModel.DataAnnotations;

namespace Shesha.Push.Dtos
{
    /// <summary>
    /// Input for sending push notification to a topic
    /// </summary>
    public class SendNotificationToTopicInput : SendNotificationInput
    {
        /// <summary>
        /// Topic
        /// </summary>
        [Required]
        public string Topic { get; set; }
    }
}
