using AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using System;

namespace Shesha.ShaRoleAppointedPersons.Dto
{
    public class ShaRoleAppointedPersonMapProfile : Profile
    {
        public ShaRoleAppointedPersonMapProfile()
        {
            CreateMap<ShaRoleAppointedPersonDto, ShaRoleAppointedPerson>();
            CreateMap<ShaRoleAppointedPerson, ShaRoleAppointedPersonDto>()
                .ForMember(u => u.Person, options => options.MapFrom(e => e.Person != null
                    ? new EntityReferenceDto<Guid?>(
                        e.Person.Id,
                        e.Person.FullName,
                        e.Person.GetType().FullName ?? string.Empty
                        )
                    : null
                ))
            .ForMember(u => u.RoleId, options => options.MapFrom(e => e.Role != null 
                ? e.Role.Id : (Guid?)null));
        }
    }
}
