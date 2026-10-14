using Newtonsoft.Json.Linq;
using System;
using System.Reflection;

namespace Shesha.Permissions.Entity
{
    public interface IPermissionedEntityProvider
    {
        bool IsEntityTypePermissioned<T>(T entity) where T : notnull;

        bool IsPropertyGranted(PropertyInfo propertyInfo);

        T GetPermissionedEntity<T>(T entity) where T : notnull;

        T GetPermissionedEntityOrEntity<T>(T entity) where T : notnull;
    }
}
