using Abp.Dependency;
using ConcurrentCollections;
using Shesha.Domain;
using Shesha.Permissions.Enum;

namespace Shesha.Permissions
{
    public static class PermissionedObjectExtensions
    {
        public static ConcurrentHashSet<string> GetActualPermissions(this PermissionedObject permissionedObject, bool useInherited = true,
            UseDependencyType useDependency = UseDependencyType.Before)
        {
            var permissionedObjectManager = IocManager.Instance.Resolve<IPermissionedObjectManager>();
            return permissionedObjectManager?.GetActualPermissions(permissionedObject.Object, useInherited, useDependency) ?? new ConcurrentHashSet<string>();
        }
    }
}