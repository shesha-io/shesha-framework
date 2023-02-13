using System;
using Shesha.AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using Shesha.Extensions;

namespace Shesha.Notes.Dto
{
    public class NoteProfile : ShaProfile
    {
        public NoteProfile()
        {
            CreateMap<CreateNoteDto, Note>();

            CreateMap<Note, NoteDto>()
                .ForMember(u => u.Author, options => 
                    options.MapFrom(e => e.Author != null 
                        ? new EntityReferenceDto<Guid>(e.Author.Id, e.Author.FullName, e.Author.GetClassName()) 
                        : null));
            CreateMap<NoteDto, Note>();

            CreateMap<UpdateNoteDto, Note>();
        }
    }
}
