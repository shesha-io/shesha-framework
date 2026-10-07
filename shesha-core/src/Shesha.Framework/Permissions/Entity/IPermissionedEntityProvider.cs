using Newtonsoft.Json.Linq;
using System;
using System.Reflection;

namespace Shesha.Permissions.Entity
{
    public interface IPermissionedEntityProvider
    {
        bool IsPropertyGranted(PropertyInfo propertyInfo);

        T GetNewProxiedPermissionedEntity<T>(T entity) where T : notnull;
    }
}
