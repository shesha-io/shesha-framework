using System;
using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;

namespace Shesha.NotificationTemplates.Dto
{
    [AutoMap(typeof(NotificationTemplate))]
    public class NotificationTemplateDto: EntityDto<Guid>
    {
        public bool IsEnabled { get; set; }
        public string Name { get; set; }
        public string Body { get; set; }
        public string Subject { get; set; }

        public EntityReferenceDto<Guid?> Notification { get; set; }
        public ReferenceListItemValueDto SendType { get; set; }
        public ReferenceListItemValueDto BodyFormat { get; set; }
    }
}
