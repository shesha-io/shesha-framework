using System;
using Abp.Application.Services.Dto;

namespace Shesha.Notifications.Dto
{
    public class NotificationDto: EntityDto<Guid>
    {
        public virtual string Name { get; set; }
        public virtual string Namespace { get; set; }
        public virtual string Description { get; set; }
    }
}
