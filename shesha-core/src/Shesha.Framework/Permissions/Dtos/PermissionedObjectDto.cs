using System;
using System.Collections.Generic;
using System.Linq;
using Abp.Application.Services.Dto;
using ConcurrentCollections;
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;

namespace Shesha.Permissions
{
    public class PermissionedObjectDto : EntityDto<Guid>
    {

        public const string CacheStoreName = "PermissionedObjectCache";

        public PermissionedObjectDto()
        {
            Permissions = new List<string>();
            Children = new List<PermissionedObjectDto>();
            Access = RefListPermissionedAccess.Inherited;
            Hidden = false;
            AdditionalParameters = new Dictionary<string, string>();
        }

        public string Object { get; set; }

        public string Category { get; set; }

        public string Module { get; set; }
        public Guid? ModuleId { get; set; }

        public string Type { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public List<string> Permissions { get; set; }

        public List<string> ActualPermissions { get; set; }
        public List<string> InheritedPermissions { get; set; }

        public RefListPermissionedAccess? Access { get; set; }

        public bool Inherited => Access == RefListPermissionedAccess.Inherited;
        public RefListPermissionedAccess? ActualAccess { get; set; }
        public RefListPermissionedAccess? InheritedAccess { get; set; }

        public string Parent { get; set; }
        public string Dependency { get; set; }
        
        public List<PermissionedObjectDto> Children { get; set; }

        public bool Hidden { get; set; }

        public Dictionary<string, string> AdditionalParameters { get; set; }

        public override string ToString()
        {
            var permissions = Hidden 
                ? "Hidden" 
                : Access == RefListPermissionedAccess.RequiresPermissions
                    ? string.Join(", ", Permissions)
                : Access.ToString();
            return $"{Object} -> {Dependency} ({permissions})";
        }
    }
}