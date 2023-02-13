using Shesha.AutoMapper;
using Shesha.Domain;

namespace Shesha.Notifications.Dto
{
    public class NotificationMapProfile : ShaProfile
    {
        public NotificationMapProfile()
        {
            CreateMap<Notification, NotificationDto>();

            CreateMap<NotificationDto, Notification>();
        }
    }
}
