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
                    options => options.MapFrom(e => e.ReferenceList != null ? new EntityReferenceDto<Guid?>(e.ReferenceList.Id, e.ReferenceList.Configuration.Name, "") : null))
                .MapReferenceListValuesToDto();

            CreateMap<ReferenceListItemDto, ReferenceListItem>()
                .ForMember(u => u.ReferenceList,
                    options => options.MapFrom(e =>
                        e.ReferenceList != null && e.ReferenceList.Id != null
                            ? GetEntity<ReferenceList, Guid>(e.ReferenceList.Id.Value)
                            : null))
                .MapReferenceListValuesFromDto();

            CreateMap<ReferenceList, ReferenceListDto>()
                .ForMember(e => e.ModuleId, m => m.MapFrom(e => e.Configuration.Module != null ? e.Configuration.Module.Id : (Guid?)null))
                .ForMember(e => e.OriginId, m => m.MapFrom(e => e.Configuration.Origin != null ? e.Configuration.Origin.Id : (Guid?)null))
                .ForMember(e => e.Module, m => m.MapFrom(e => e.Configuration.Module != null ? e.Configuration.Module.Name : null))
                .ForMember(e => e.IsLastVersion, m => m.MapFrom(e => e.Configuration != null ? e.Configuration.IsLast : false))
                .ForMember(e => e.Name, m => m.MapFrom(e => e.Configuration.Name))
                .ForMember(e => e.Namespace, m => m.MapFrom(e => e.Namespace))
                .ForMember(e => e.Label, m => m.MapFrom(e => e.Configuration.Label))
                .ForMember(e => e.Description, m => m.MapFrom(e => e.Configuration.Description))
                .ForMember(e => e.VersionNo, m => m.MapFrom(e => e.Configuration.VersionNo))
                .ForMember(e => e.VersionStatus, m => m.MapFrom(e => e.Configuration.VersionStatus));

            CreateMap<ReferenceList, ReferenceListWithItemsDto>()
                .ForMember(e => e.ModuleId, m => m.MapFrom(e => e.Configuration.Module != null ? e.Configuration.Module.Id : (Guid?)null))
                .ForMember(e => e.OriginId, m => m.MapFrom(e => e.Configuration.Origin != null ? e.Configuration.Origin.Id : (Guid?)null))
                .ForMember(e => e.Module, m => m.MapFrom(e => e.Configuration.Module != null ? e.Configuration.Module.Name : null))
                .ForMember(e => e.IsLastVersion, m => m.MapFrom(e => e.Configuration != null ? e.Configuration.IsLast : false))
                .ForMember(e => e.Name, m => m.MapFrom(e => e.Configuration.Name))
                .ForMember(e => e.Namespace, m => m.MapFrom(e => e.Namespace))
                .ForMember(e => e.Label, m => m.MapFrom(e => e.Configuration.Label))
                .ForMember(e => e.Description, m => m.MapFrom(e => e.Configuration.Description))
                .ForMember(e => e.VersionNo, m => m.MapFrom(e => e.Configuration.VersionNo))
                .ForMember(e => e.VersionStatus, m => m.MapFrom(e => e.Configuration.VersionStatus));
        }
    }
}
