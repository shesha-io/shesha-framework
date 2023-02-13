using System;
using Shesha.AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.Extensions;

namespace Shesha.NotificationTemplates.Dto
{
    public class NotificationTemplateMapProfile : ShaProfile
    {
        public NotificationTemplateMapProfile()
        {
            CreateMap<NotificationTemplate, NotificationTemplateDto>()
                .ForMember(u => u.Notification, 
                    options => options.MapFrom(e => e.Notification != null 
                        ? new EntityReferenceDto<Guid?>(e.Notification.Id, e.Notification.Name, e.Notification.GetClassName()) : null))
                .MapReferenceListValuesToDto();

            CreateMap<NotificationTemplateDto, NotificationTemplate>()
                .ForMember(u => u.Notification,
                    options => options.MapFrom(e =>
                        e.Notification != null && e.Notification.Id != null
                            ? GetEntity<Notification, Guid>(e.Notification.Id.Value)
                            : null))
                .MapReferenceListValuesFromDto();

        }
    }
}
