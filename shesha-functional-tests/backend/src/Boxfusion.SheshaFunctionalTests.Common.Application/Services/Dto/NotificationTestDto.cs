using Abp.Application.Services.Dto;
using Shesha.Domain.Enums;
using Shesha.EntityReferences;
using Shesha.Notifications.Dto;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto
{
    public class NotificationDto
    {
        public List<NotificationAttachmentDto>? NotificationAttachments { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public EntityDto<Guid>? Type { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public EntityDto<Guid>? Channel { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public RefListNotificationPriority Priority { get; set; } = RefListNotificationPriority.Low;
        /// <summary>
        /// 
        /// </summary>
        public EntityDto<Guid>? Recipient { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public string? RecipientText { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public string? Cc { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public GenericEntityReference? TriggeringEntity { get; set; }
    }
}
