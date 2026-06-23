using Shesha.Domain;
using Shesha.Services;
using System.Collections.Generic;

namespace Shesha.Permissions
{
    public static class PermissionedObjectExtensions
    {
        public static List<string> GetActualPermissions(this PermissionedObject permissionedObject, bool useInherited = true)
        {
            var permissionedObjectManager = StaticContext.IocManager.Resolve<IPermissionedObjectManager>();
            return permissionedObjectManager?.GetActualPermissions(permissionedObject.Object, permissionedObject.Type, useInherited) ?? new List<string>();
        }
    }
}