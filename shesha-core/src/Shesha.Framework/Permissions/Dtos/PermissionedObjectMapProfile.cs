using System;
using System.Collections.Generic;
using Shesha.AutoMapper;
using Shesha.Domain;
using Shesha.Metadata.Dtos;
using System.Linq;
using Shesha.DynamicEntities.Dtos;

namespace Shesha.Permissions.Dtos
{
    public class PermissionedObjectMapProfile : ShaProfile
    {
        public PermissionedObjectMapProfile()
        {
            CreateMap<PermissionedObjectDto, PermissionedObject>()
                .ForMember(e => e.Permissions, c => c.MapFrom(e => string.Join(",", e.Permissions)));
            CreateMap<PermissionedObject, PermissionedObjectDto>()
                .ForMember(e => e.Permissions, c => c.MapFrom(e => 
                    e.Permissions == null 
                        ? new List<string>() 
                        : e.Permissions.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList()));
        }
    }
}
