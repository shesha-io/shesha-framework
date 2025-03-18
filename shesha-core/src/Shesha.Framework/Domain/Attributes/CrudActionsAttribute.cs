using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.Domain.Attributes
{
    [AttributeUsage(AttributeTargets.Class, Inherited = true, AllowMultiple = true)]
    public class CrudAccessAttribute: Attribute
    {
        public RefListPermissionedAccess? All { get; set; } = null;
        public List<string> AllPermissions { get; set; } = new List<string>();
        public RefListPermissionedAccess? Create { get; set; } = null;
        public List<string> CreatePermissions { get; set; } = new List<string>();
        public RefListPermissionedAccess? Read { get; set; } = null;
        public List<string> ReadPermissions { get; set; } = new List<string>();
        public RefListPermissionedAccess? Update { get; set; } = null;
        public List<string> UpdatePermissions { get; set; } = new List<string>();
        public RefListPermissionedAccess? Delete { get; set; } = null;
        public List<string> DeletePermissions { get; set; } = new List<string>();

        public CrudAccessAttribute(CrudActions action, bool enabled)
        {
            Init(action, enabled ? RefListPermissionedAccess.Inherited : RefListPermissionedAccess.Disable, null);
        }

        public CrudAccessAttribute(CrudActions action, RefListPermissionedAccess access)
        {
            Init(action, access, null);
        }

        public CrudAccessAttribute(CrudActions action, RefListPermissionedAccess access, string[] permissions)
        {
            Init(action, access, permissions);
        }

        public void Init(CrudActions action, RefListPermissionedAccess access, string[]? permissions)
        {
            switch (action)
            {
                case CrudActions.Create:
                    Create = access;
                    CreatePermissions = permissions?.ToList() ?? new List<string>();
                    break;
                case CrudActions.Read:
                    Read = access;
                    ReadPermissions = permissions?.ToList() ?? new List<string>();
                    break;
                case CrudActions.Update:
                    Update = access;
                    UpdatePermissions = permissions?.ToList() ?? new List<string>();
                    break;
                case CrudActions.Delete:
                    Delete = access;
                    DeletePermissions = permissions?.ToList() ?? new List<string>();
                    break;
                case CrudActions.All:
                    All = access;
                    AllPermissions = permissions?.ToList() ?? new List<string>();
                    break;
            }
        }
    }
}
