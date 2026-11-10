using AutoMapper;
using Shesha.AutoMapper.Dto;
using Shesha.Domain;
using System;
using System.Linq;

namespace Shesha.ShaRoleAppointedPersons.Dto
{
    public class ShaRoleAppointedPersonMapProfile : Profile
    {
        public ShaRoleAppointedPersonMapProfile()
        {
            CreateMap<ShaRoleAppointedPersonDto, ShaRoleAppointedPerson>();
            CreateMap<ShaRoleAppointedPerson, ShaRoleAppointedPersonDto>()
                .ForMember(u => u.PersonId, options => options.MapFrom(e => e.Person != null ? e.Person.Id : (Guid?)null))
                .ForMember(u => u.RoleId, options => options.MapFrom(e => e.Role != null ? e.Role.Id : (Guid?)null))
                .ForMember(u => u.PermissionedEntities, options => options.MapFrom(e => e.PermissionedEntities
                        .Select(entity => new EntityReferenceDto<string>(entity.Id, entity._className, entity._displayName))
                        .ToList()));
        }
    }
}
