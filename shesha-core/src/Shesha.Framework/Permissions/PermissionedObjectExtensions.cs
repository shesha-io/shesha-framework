using Abp.Dependency;
using ConcurrentCollections;
using Shesha.Domain;
using System.Collections.Generic;

namespace Shesha.Permissions
{
    public static class PermissionedObjectExtensions
    {
        public static List<string> GetActualPermissions(this PermissionedObject permissionedObject, bool useInherited = true)
        {
            var permissionedObjectManager = IocManager.Instance.Resolve<IPermissionedObjectManager>();
            return permissionedObjectManager?.GetActualPermissions(permissionedObject.Object, permissionedObject.Type, useInherited) ?? new List<string>();
        }
    }
}