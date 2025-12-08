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
                    ? new EntityReferenceDto<Guid>(e.Person)
                    : null
                ))
                .ForMember(u => u.RoleId, options => options.MapFrom(e => e.Role != null ? e.Role.Id : (Guid?)null));
            CreateMap<ShaRoleAppointedPerson, ShaRoleAppointedPersonDto>()
                .ForMember(
                    dest => dest.Person,
                    opt => opt.MapFrom(src => src.Person == null
                        ? null
                        : new EntityReferenceDto<Guid?>
                        {
                            Id = src.Person.Id
                        }
                    )
                );
        }
    }
}
