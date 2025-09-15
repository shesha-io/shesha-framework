using Abp.Application.Services.Dto;
using Shesha.Domain;
using Shesha.Domain.Enums;
using System;

namespace Shesha.Notifications.Distribution.NotificationTypes.Dto
{
    /// <summary>
    /// Distributed DTO of the <see cref="NotificationTemplate"/>
    /// </summary>
    public class DistributedNotificationTemplateDto: EntityDto<Guid>, INotificationTemplateProps
    {
        public RefListNotificationMessageFormat MessageFormat { get; set; }
        public string TitleTemplate { get; set; }
        public string BodyTemplate { get; set; }
    }
}
