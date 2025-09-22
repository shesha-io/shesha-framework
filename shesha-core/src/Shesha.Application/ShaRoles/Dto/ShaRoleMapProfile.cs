using AutoMapper;
using Shesha.Domain;
using System.Linq;

namespace Shesha.ShaRoles.Dto
{
    public class ShaRoleAppointedPersonMapProfile : Profile
    {
        public ShaRoleAppointedPersonMapProfile()
        {
            CreateMap<CreateShaRoleDto, ShaRole>();

            
            CreateMap<ShaRoleDto, ShaRole>();

            CreateMap<ShaRole, ShaRoleDto>()
                .ForMember(e => e.Permissions, c => c.MapFrom(e => e.Permissions.Select(x => x.Permission)));
        }
    }
}
