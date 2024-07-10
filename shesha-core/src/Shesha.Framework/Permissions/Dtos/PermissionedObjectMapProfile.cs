using Shesha.AutoMapper;
using Shesha.Domain;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.Permissions.Dtos
{
    public class PermissionedObjectMapProfile : ShaProfile
    {
        public PermissionedObjectMapProfile()
        {
            CreateMap<PermissionedObjectDto, PermissionedObject>()
                .ForMember(e => e.Permissions, c => c.MapFrom(e => string.Join(",", e.Permissions)))
                .ForMember(e => e.Module, c => c.Ignore());
            CreateMap<PermissionedObject, PermissionedObjectDto>()
                .ForMember(e => e.Permissions, c => c.MapFrom(e =>
                    e.Permissions == null
                        ? new List<string>()
                        : e.Permissions.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList()))
                .ForMember(e => e.ModuleId, c => c.MapFrom(m => (object)(m.Module == null ? null : m.Module.Id)))
                .ForMember(e => e.Module, c => c.MapFrom(m => (object)(m.Module == null ? null : m.Module.Name)));
            CreateMap<PermissionedObjectFull, PermissionedObjectDto>()
                .ForMember(e => e.Permissions, c => c.MapFrom(e =>
                    e.Permissions == null
                        ? new List<string>()
                        : e.Permissions.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList()))
                .ForMember(e => e.ActualPermissions, c => c.MapFrom(e =>
                    e.ActualPermissions == null
                        ? new List<string>()
                        : e.ActualPermissions.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList()))
                .ForMember(e => e.InheritedPermissions, c => c.MapFrom(e =>
                    e.InheritedPermissions == null
                        ? new List<string>()
                        : e.InheritedPermissions.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList()))
                ;
        }
    }
}
