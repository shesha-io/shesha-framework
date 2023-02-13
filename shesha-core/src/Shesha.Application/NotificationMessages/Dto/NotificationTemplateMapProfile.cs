using System;
using Shesha.AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Notifications.Dto;

namespace Shesha.NotificationMessages.Dto
{
    public class NotificationTemplateMapProfile : ShaProfile
    {
        public NotificationTemplateMapProfile()
        {
            CreateMap<NotificationMessage, NotificationMessageDto>()
                .ForMember(u => u.Sender, 
                    options => options.MapFrom(e => e.Sender != null 
                        ? new EntityReferenceDto<Guid?>(e.Sender.Id, e.Sender.FullName, e.Sender.GetClassName()) : null))
                .ForMember(u => u.Recipient,
                    options => options.MapFrom(e => e.Recipient != null 
                        ? new EntityReferenceDto<Guid?>(e.Recipient.Id, e.Recipient.FullName, e.Recipient.GetClassName()) : null))
                .ForMember(u => u.Template,
                    options => options.MapFrom(e => e.Template != null 
                        ? new EntityReferenceDto<Guid?>(e.Template.Id, e.Template.Name, e.Template.GetClassName()) : null))
                .ForMember(u => u.Notification,
                    options => options.MapFrom(e => e.Notification != null 
                        ? new EntityReferenceDto<Guid?>(e.Notification.Id, e.Notification.Name, e.Notification.GetClassName()) : null))
                .MapReferenceListValuesToDto();

            CreateMap<NotificationMessageAttachment, NotificationAttachmentDto>()
                .ForMember(u => u.StoredFileId,
                    options => options.MapFrom(e => e.File != null ? e.File.Id : Guid.Empty));
        }
    }
}
