using Abp.Application.Services.Dto;
using Shesha.DelayedUpdate;
using Shesha.EntityReferences;
using Shesha.Notifications.Dto;

namespace Boxfusion.SheshaFunctionalTests.Common.Application.Services.Dto
{
    public class NotificationDto
    {
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

        public DelayedUpdateGroup[]? _delayedUpdate { get; set; }
    }
}
