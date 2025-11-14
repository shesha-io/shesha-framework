using Shesha.AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using System;

namespace Shesha.Notes.Dto
{
    public class NoteProfile : ShaProfile
    {
        public NoteProfile()
        {
            CreateMap<CreateNoteDto, Note>()
                .ForMember(u => u.OwnerType, options => options.Ignore());

            CreateMap<Note, NoteDto>()
                .ForMember(u => u.OwnerType, options => options.Ignore())
                .ForMember(u => u.Author, options => options.MapFrom(e => e.Author != null ? new EntityReferenceDto<Guid>(e.Author) : null));
            
            CreateMap<NoteDto, Note>()
                .ForMember(u => u.OwnerType, options => options.Ignore());

            CreateMap<UpdateNoteDto, Note>()
                .ForMember(u => u.OwnerType, options => options.Ignore());
        }
    }
}
