using System;

namespace Shesha.Notifications.Dto
{
    /// <summary>
    /// Notification Attachment Dto
    /// </summary>
    public class NotificationAttachmentDto
    {
        /// <summary>
        /// File name
        /// </summary>
        public string FileName { get; set; }

        /// <summary>
        /// Id of the stored file
        /// </summary>
        public Guid StoredFileId { get; set; }
    }
}
