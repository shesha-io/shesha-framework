using Shesha.Domain.Enums;
using System.Collections.Generic;

namespace Shesha.Domain.Models
{
    /// <summary>
    /// Access parameters
    /// </summary>
    public class AccessParams
    {
        public RefListPermissionedAccess? Access { get; set; }
        public List<string>? Permissions { get; set; }

        public AccessParams(RefListPermissionedAccess access, List<string>? permissions = null)
        {
            Access = access;
            Permissions = permissions;
        }

        public AccessParams(List<string> permissions)
        {
            Access = RefListPermissionedAccess.RequiresPermissions;
            Permissions = permissions;
        }
    }
}
