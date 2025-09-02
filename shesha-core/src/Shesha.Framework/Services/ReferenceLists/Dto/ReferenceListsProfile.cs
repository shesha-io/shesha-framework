using Shesha.AutoMapper;
using Shesha.Domain;
using System;

namespace Shesha.Services.ReferenceLists.Dto
{
    public class ReferenceListsProfile: ShaProfile
    {
        public ReferenceListsProfile()
        {
            CreateMap<ReferenceListItem, ReferenceListItemDto>()
                .MapReferenceListValuesToDto();

            CreateMap<ReferenceListItemDto, ReferenceListItem>()
                .ForMember(u => u.ReferenceListRevision,
                    options => options.MapFrom(e =>
                        e.ReferenceList != null && e.ReferenceList.Id != null
                            ? GetEntity<ReferenceList, Guid>(e.ReferenceList.Id.Value)
                            : null))
                .MapReferenceListValuesFromDto();

            CreateMap<ReferenceList, ReferenceListDto>()
                .ForMember(e => e.ModuleId, m => m.MapFrom(e => e.Module != null ? e.Module.Id : (Guid?)null))
                .ForMember(e => e.OriginId, m => m.MapFrom(e => e.Origin != null ? e.Origin.Id : (Guid?)null))
                .ForMember(e => e.Module, m => m.MapFrom(e => e.Module != null ? e.Module.Name : null))
                .ForMember(e => e.Name, m => m.MapFrom(e => e.Name))
                .ForMember(e => e.Label, m => m.MapFrom(e => e.Revision.Label))
                .ForMember(e => e.Description, m => m.MapFrom(e => e.Revision.Description));

            CreateMap<ReferenceList, ReferenceListWithItemsDto>()
                .ForMember(e => e.ModuleId, m => m.MapFrom(e => e.Module != null ? e.Module.Id : (Guid?)null))
                .ForMember(e => e.OriginId, m => m.MapFrom(e => e.Origin != null ? e.Origin.Id : (Guid?)null))
                .ForMember(e => e.Module, m => m.MapFrom(e => e.Module != null ? e.Module.Name : null))
                .ForMember(e => e.Name, m => m.MapFrom(e => e.Name))
                .ForMember(e => e.Label, m => m.MapFrom(e => e.Revision.Label))
                .ForMember(e => e.Description, m => m.MapFrom(e => e.Revision.Description));
        }
    }
}
