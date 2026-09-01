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

        // code based persmission Md5
        public string Md5 { get; set; }

        /// <summary>
        /// Independent copy, for callers that build a tree by appending to <see cref="Children"/>.
        /// The cache hands out shared references, so mutating a value read from it would leave the
        /// cached object permanently carrying that tree.
        /// </summary>
        public PermissionedObjectDto Copy()
        {
            // Children are copied recursively: a new list holding the same child instances
            // would still let a caller mutate nodes shared with the cached object.
            var children = new List<PermissionedObjectDto>();
            if (Children != null)
            {
                foreach (var child in Children)
                    children.Add(child?.Copy());
            }

            return new PermissionedObjectDto
            {
                Id = Id,
                Hardcoded = Hardcoded,
                Object = Object,
                Category = Category,
                Module = Module,
                ModuleId = ModuleId,
                Type = Type,
                Name = Name,
                Description = Description,
                Permissions = Permissions != null ? new List<string>(Permissions) : null,
                ActualPermissions = ActualPermissions != null ? new List<string>(ActualPermissions) : null,
                InheritedPermissions = InheritedPermissions != null ? new List<string>(InheritedPermissions) : null,
                Access = Access,
                ActualAccess = ActualAccess,
                InheritedAccess = InheritedAccess,
                Parent = Parent,
                Children = children,
                Hidden = Hidden,
                AdditionalParameters = AdditionalParameters != null
                    ? new Dictionary<string, string>(AdditionalParameters)
                    : null,
                Md5 = Md5,
            };
        }
    }
}