using Shesha.AutoMapper;
using Shesha.Domain;
using System;

namespace Shesha.Notifications.Dto
{
    public class NotificationProfile : ShaProfile
    {
        public NotificationProfile()
        {
            CreateMap<NotificationTypeConfig, NotificationTypeConfigDto>()
                .ForMember(e => e.ModuleId, m => m.MapFrom(e => e.Module != null ? e.Module.Id : (Guid?)null))
                .ForMember(e => e.OriginId, m => m.MapFrom(e => e.Origin != null ? e.Origin.Id : (Guid?)null))
                .ForMember(e => e.Module, m => m.MapFrom(e => e.Module != null ? e.Module.Name : null))
                .ForMember(e => e.Name, m => m.MapFrom(e => e.Name))
                .ForMember(e => e.Label, m => m.MapFrom(e => e.Revision.Label))
                .ForMember(e => e.Description, m => m.MapFrom(e => e.Revision.Description));
        }
    }
}
