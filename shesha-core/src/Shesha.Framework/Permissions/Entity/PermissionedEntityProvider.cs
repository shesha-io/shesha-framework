using Abp.Dependency;
using Abp.Runtime.Session;
using Castle.DynamicProxy;
using Shesha.Authorization;
using Shesha.Configuration.Runtime;
using Shesha.Domain.Enums;
using Shesha.Reflection;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;

namespace Shesha.Permissions.Entity
{
    public class PermissionedEntityProvider : IPermissionedEntityProvider, IPerWebRequestDependency
    {
        private static readonly ProxyGeneratorWithoutCtor _proxyGenerator = new ProxyGeneratorWithoutCtor();
        private readonly IPermissionedEntityInterceptor _interceptor;
        private readonly IEntityTypeConfigurationStore _configurationStore;
        private readonly IAbpSession _abpSession;
        private readonly IShaPermissionChecker _permissionChecker;

        private readonly ConcurrentDictionary<object, object> _proxyCache;

        public PermissionedEntityProvider(IPermissionedEntityInterceptor interceptor, IEntityTypeConfigurationStore configurationStore, IAbpSession abpSession, IShaPermissionChecker permissionChecker)
        {
            _interceptor = interceptor;
            _interceptor.SetProvider(this);
            _configurationStore = configurationStore;
            _abpSession = abpSession;
            _permissionChecker = permissionChecker;
            _proxyCache = new ConcurrentDictionary<object, object>(ReferenceEqualityComparer.Instance);
        }

        public bool IsPropertyGranted(PropertyInfo propertyInfo)
        {
            var propertyPermission = propertyInfo.GetCustomAttribute<SheshaAuthorizeAttribute>();
            if (propertyPermission != null)
            {
                if (propertyPermission.Access == RefListPermissionedAccess.AllowAnonymous) return true;
                if (propertyPermission.Access == RefListPermissionedAccess.AnyAuthenticated) return _abpSession.UserId.HasValue;
                if (propertyPermission.Access == RefListPermissionedAccess.RequiresPermissions)
                {
                    if (!_abpSession.UserId.HasValue) return false;
                    return !propertyPermission.Permissions.Any() || propertyPermission.Permissions.Any(p => _permissionChecker.IsGranted(p));
                }
                if (propertyPermission.Access == RefListPermissionedAccess.Disable) return false;
            }
            return true;
        }

        public virtual T GetPermissionedEntity<T>(T entity) where T : notnull
        {
            if (entity is IPermissionedEntityProxy)
                return entity;

            return (T)_proxyCache.GetOrAdd(entity, e =>
                _proxyGenerator.CreateClassProxyWithoutRunningCtor(
                    e.GetType().StripCastleProxyType(),
                    e,
                    ProxyGenerationOptions.Default,
                    _interceptor
                )
            );
        }

        public bool IsEntityTypePermissioned<T>(T entity) where T : notnull
        {
            var entityType = entity.GetType().StripCastleProxyType();
            return _configurationStore.Get(entityType)?.HasPermissionedProperties ?? false;
        }

        public T GetPermissionedEntityOrEntity<T>(T entity) where T : notnull
        {
            return IsEntityTypePermissioned(entity)
                ? GetPermissionedEntity(entity)
                : entity;
        }
    }

    public class ProxyGeneratorWithoutCtor : ProxyGenerator
    {
        public object CreateClassProxyWithoutRunningCtor(Type type, object target, ProxyGenerationOptions options, IInterceptor interceptor)
        {
            var proxyType = this.CreateClassProxyTypeWithTarget(type, [typeof(IPermissionedEntityProxy)], options);
            var instance = RuntimeHelpers.GetUninitializedObject(proxyType);
            SetField(instance, "__interceptors", new[] { interceptor });
            SetField(instance, "__target", target);
            return instance;
        }

        private static void SetField(object proxy, string fieldName, object value)
        {
            var field = proxy.GetType().GetField(fieldName, BindingFlags.Instance | BindingFlags.NonPublic);
            if (field == null)
                throw new InvalidOperationException($"Field '{fieldName}' not found for {proxy.GetType()}. Check the Castle DynamicProxy version.");
            field.SetValue(proxy, value);
        }
    }
}
