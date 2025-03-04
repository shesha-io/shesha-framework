using AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.ShaRoleAppointedPersons.Dto
{
    public class ShaRoleAppointedPersonMapProfile : Profile
    {
        public ShaRoleAppointedPersonMapProfile()
        {
            CreateMap<ShaRoleAppointedPersonDto, ShaRoleAppointedPerson>();
            CreateMap<ShaRoleAppointedPerson, ShaRoleAppointedPersonDto>()
                .ForMember(u => u.Person, options => options.MapFrom(e => e.Person != null
                    ? new EntityReferenceDto<Guid>(e.Person) 
                    : null
                ))
                .ForMember(u => u.RoleId, options => options.MapFrom(e => e.Role != null ? e.Role.Id : (Guid?)null))
                .ForMember(u => u.Regions, options => options.MapFrom(e => GetRegions(e)));
        }

        public static List<EntityReferenceDto<Guid>> GetRegions(ShaRoleAppointedPerson entity)
        {
            return entity.GetRelatedAreas().Select(e => new EntityReferenceDto<Guid>(e)).ToList();
        }
    }
}
