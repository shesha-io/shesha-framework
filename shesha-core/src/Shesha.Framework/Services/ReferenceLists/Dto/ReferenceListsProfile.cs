using Shesha.AutoMapper;
using Shesha.Domain;
using System;

namespace Shesha.Services.ReferenceLists.Dto
{
    public class ReferenceListsProfile: ShaProfile
    {
        public ReferenceListsProfile()
        {
            CreateMap<ReferenceList, ReferenceListDto>()
                .ForMember(e => e.Module, m => m.MapFrom(e => e.Module != null ? e.Module.Name : null))
                .ForMember(e => e.Name, m => m.MapFrom(e => e.Name))
                .ForMember(e => e.Label, m => m.MapFrom(e => e.Label))
                .ForMember(e => e.Description, m => m.MapFrom(e => e.Description));

            CreateMap<ReferenceList, ReferenceListWithItemsDto>()
                .ForMember(e => e.Module, m => m.MapFrom(e => e.Module != null ? e.Module.Name : null))
                .ForMember(e => e.Name, m => m.MapFrom(e => e.Name))
                .ForMember(e => e.Label, m => m.MapFrom(e => e.Label))
                .ForMember(e => e.Description, m => m.MapFrom(e => e.Description));
        }
    }
}
