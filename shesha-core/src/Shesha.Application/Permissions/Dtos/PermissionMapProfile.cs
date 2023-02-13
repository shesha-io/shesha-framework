using System;
using System.Collections.Generic;
using Shesha.AutoMapper;
using Shesha.Domain;
using Shesha.Metadata.Dtos;
using System.Linq;
using Abp.Localization;
using Shesha.DynamicEntities.Dtos;
using Shesha.Roles.Dto;

namespace Shesha.Permissions.Dtos
{
    public class PermissionMapProfile : ShaProfile
    {
        public PermissionMapProfile()
        {
            CreateMap<Abp.Authorization.Permission, PermissionDto>()
                .ForMember(e => e.ParentName, c => c.MapFrom(e => 
                    e.Parent != null ? e.Parent.Name : null))
                .ForMember(e => e.DisplayName, c => c.MapFrom(e =>
                    Localize(e.DisplayName)))
                .ForMember(e => e.Id, c => c.MapFrom(e => e.Name))
                .ForMember(e => e.IsDbPermission, c => c.MapFrom(e =>
                    e.Properties != null && e.Properties.ContainsKey("IsDbPermission") && (bool)e.Properties["IsDbPermission"]
                    ))
                ;
        }
    }
}
