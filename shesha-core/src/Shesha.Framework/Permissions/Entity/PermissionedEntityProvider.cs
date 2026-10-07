using Abp.Dependency;
using Abp.Runtime.Session;
using Castle.DynamicProxy;
using Shesha.Authorization;
using Shesha.Domain.Enums;
using Shesha.Reflection;
using System.Linq;
using System.Reflection;

namespace Shesha.Permissions.Entity
{
    public class PermissionedEntityProvider : IPermissionedEntityProvider, ISingletonDependency
    {
        private readonly IProxyGenerator _proxyGenerator;
        private readonly IInterceptor _interceptor;
        private readonly IIocManager _iocManager;

        public PermissionedEntityProvider(IPermissionedEntityInterceptor interceptor, IIocManager iocManager)
        {
            _proxyGenerator = new ProxyGenerator();
            _interceptor = interceptor;
            _iocManager = iocManager;
        }

        public bool IsPropertyGranted(PropertyInfo propertyInfo)
        {
            var propertyPermission = propertyInfo.GetCustomAttribute<SheshaAuthorizeAttribute>();
            var abpSession = _iocManager.Resolve<IAbpSession>();

            if (propertyPermission != null)
            {
                if (propertyPermission.Access == RefListPermissionedAccess.AllowAnonymous) return true;
                if (propertyPermission.Access == RefListPermissionedAccess.AnyAuthenticated) return abpSession.UserId.HasValue;

                if (propertyPermission.Access == RefListPermissionedAccess.RequiresPermissions && propertyPermission.Permissions.Any())
                {
                    var typeName = propertyInfo.PropertyType.Name;
                    var permissionChecker = _iocManager.Resolve<IShaPermissionChecker>();
                    var isGranted = false;
                    foreach (var permission in propertyPermission.Permissions) isGranted |= permissionChecker.IsGranted(permission);
                    return isGranted;
                }
            }
            return true;
        }

        public virtual T GetNewProxiedPermissionedEntity<T>(T entity) where T : notnull
        {
            if (entity is IPermissionedEntityProxy)
                return entity;
            var p = new ProxyGenerationOptions();
            p.AddMixinInstance(new PermissionedEntityProxy(this));
            return (T)_proxyGenerator.CreateClassProxyWithTarget(entity.GetType().StripCastleProxyType(), entity, p, _interceptor);
        }

    }
}
