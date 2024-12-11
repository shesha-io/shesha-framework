using Abp.Application.Services.Dto;
using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;

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
            Hardcoded = false;
        }

        public virtual bool? Hardcoded { get; set; }

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
            return $"{Object} -> ({permissions})";
        }

        public string Md5 { get; set; } 
    }
}