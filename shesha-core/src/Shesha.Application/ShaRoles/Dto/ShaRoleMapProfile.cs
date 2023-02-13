using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Shesha.Domain;

namespace Shesha.ShaRoles.Dto
{
    public class ShaRoleAppointedPersonMapProfile : Profile
    {
        public ShaRoleAppointedPersonMapProfile()
        {
            CreateMap<CreateShaRoleDto, ShaRole>();

            CreateMap<ShaRoleDto, ShaRole>()
                .ForMember(e => e.Permissions, c => c.MapFrom((s, d, m, ctx)  => d.MapPermissions(s.Permissions) ));
            CreateMap<ShaRole, ShaRoleDto>()
                .ForMember(e => e.Permissions, c => c.MapFrom(e => e.Permissions.Select(x => x.Permission)));

        }
    }
}
