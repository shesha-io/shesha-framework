using Shesha.AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using System;

namespace Shesha.Services.ReferenceLists.Dto
{
    public class ReferenceListsProfile: ShaProfile
    {
        public ReferenceListsProfile()
        {
            CreateMap<ReferenceListItem, ReferenceListItemDto>()
                .ForMember(u => u.ReferenceList,
                    options => options.MapFrom(e => e.ReferenceList != null ? new EntityReferenceDto<Guid?>(e.ReferenceList.Id, e.ReferenceList.Name, "") : null))
                .MapReferenceListValuesToDto();

            CreateMap<ReferenceListItemDto, ReferenceListItem>()
                .ForMember(u => u.ReferenceList,
                    options => options.MapFrom(e =>
                        e.ReferenceList != null && e.ReferenceList.Id != null
                            ? GetEntity<ReferenceList, Guid>(e.ReferenceList.Id.Value)
                            : null))
                .MapReferenceListValuesFromDto();

            CreateMap<ReferenceList, ReferenceListDto>()
                .ForMember(e => e.ModuleId, m => m.MapFrom(e => e.Module != null ? e.Module.Id : (Guid?)null))
                .ForMember(e => e.OriginId, m => m.MapFrom(e => e.Origin != null ? e.Origin.Id : (Guid?)null))
                .ForMember(e => e.Module, m => m.MapFrom(e => e.Module != null ? e.Module.Name : null))
                .ForMember(e => e.IsLastVersion, m => m.MapFrom(e => e.IsLast))
                .ForMember(e => e.Name, m => m.MapFrom(e => e.Name))
                .ForMember(e => e.Namespace, m => m.MapFrom(e => e.Namespace))
                .ForMember(e => e.Label, m => m.MapFrom(e => e.Label))
                .ForMember(e => e.Description, m => m.MapFrom(e => e.Description))
                .ForMember(e => e.VersionNo, m => m.MapFrom(e => e.VersionNo))
                .ForMember(e => e.VersionStatus, m => m.MapFrom(e => e.VersionStatus));

            CreateMap<ReferenceList, ReferenceListWithItemsDto>()
                .ForMember(e => e.ModuleId, m => m.MapFrom(e => e.Module != null ? e.Module.Id : (Guid?)null))
                .ForMember(e => e.OriginId, m => m.MapFrom(e => e.Origin != null ? e.Origin.Id : (Guid?)null))
                .ForMember(e => e.Module, m => m.MapFrom(e => e.Module != null ? e.Module.Name : null))
                .ForMember(e => e.IsLastVersion, m => m.MapFrom(e => e.IsLast))
                .ForMember(e => e.Name, m => m.MapFrom(e => e.Name))
                .ForMember(e => e.Namespace, m => m.MapFrom(e => e.Namespace))
                .ForMember(e => e.Label, m => m.MapFrom(e => e.Label))
                .ForMember(e => e.Description, m => m.MapFrom(e => e.Description))
                .ForMember(e => e.VersionNo, m => m.MapFrom(e => e.VersionNo))
                .ForMember(e => e.VersionStatus, m => m.MapFrom(e => e.VersionStatus));
        }
    }
}
