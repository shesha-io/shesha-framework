using Abp.Application.Services.Dto;
using Shesha.AutoMapper.Dto;
using Shesha.Notifications.Dto;
using System;
using System.Collections.Generic;

namespace Shesha.NotificationMessages.Dto
{
    public class NotificationMessageDto : EntityDto<Guid>
    {
        /// <summary>
        /// Person who sent this message
        /// </summary>
        public EntityReferenceDto<Guid?> Sender { get; set; }

        /// <summary>
        /// Recipient (person) of the message
        /// </summary>
        public EntityReferenceDto<Guid?> Recipient { get; set; }

        /// <summary>
        /// Send type (email/sms/push etc)
        /// </summary>
        public ReferenceListItemValueDto SendType { get; set; }

        /// <summary>
        /// Recipient text (email address/mobile number etc)
        /// </summary>
        public string RecipientText { get; set; }

        /// <summary>
        /// Subject of the message
        /// </summary>
        public string Subject { get; set; }

        /// <summary>
        /// Message body
        /// </summary>
        public string Body { get; set; }

        /// <summary>
        /// Template that was used for message generation
        /// </summary>
        public EntityReferenceDto<Guid?> Template { get; set; }

        /// <summary>
        /// Notification
        /// </summary>
        public EntityReferenceDto<Guid?> Notification { get; set; }

        /// <summary>
        /// Source Entity
        /// </summary>
        public EntityReferenceDto<Guid?> SourceEntity { get; set; }

        /// <summary>
        /// Attachments
        /// </summary>
        public List<NotificationAttachmentDto> Attachments { get; set; } = new List<NotificationAttachmentDto>();

        /// <summary>
        /// Date and time of last attempt to send the message
        /// </summary>
        public DateTime? SendDate { get; set; }

        /// <summary>
        /// Number of attempt to send the message
        /// </summary>
        public int TryCount { get; set; }

        /// <summary>
        /// Status (outgoing/sent/failed etc)
        /// </summary>
        public ReferenceListItemValueDto Status { get; set; }

        /// <summary>
        /// Error message
        /// </summary>
        public string ErrorMessage { get; set; }
        /// <summary>
        /// Indicates whether or not a user has viewed the notificationMessage,
        /// </summary>
        public bool? Opened { get; set; }
        /// <summary>
        /// The Date and time the user last viewed the notificationMessage
        /// </summary>
        public DateTime? LastOpened { get; set; }
    }
}
