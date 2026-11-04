using Abp.Authorization;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Uow;
using Abp.Localization;
using Shesha.Domain.Enums;
using Shesha.Permissions;
using Shesha.Utilities;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Authorization
{
    public class ObjectPermissionChecker : IObjectPermissionChecker, ITransientDependency
    {

        private readonly IAuthorizationConfiguration _authConfiguration;
        private readonly IPermissionedObjectManager _permissionedObjectManager;
        private readonly IShaPermissionChecker _permissionChecker;
        private readonly ILocalizationManager _localizationManager;

        public ObjectPermissionChecker(
            IAuthorizationConfiguration authConfiguration,
            IPermissionedObjectManager permissionedObjectManager,
            IShaPermissionChecker permissionChecker,
            ILocalizationManager localizationManager
        )
        {
            _authConfiguration = authConfiguration;
            _permissionedObjectManager = permissionedObjectManager;
            _permissionChecker = permissionChecker;
            _localizationManager = localizationManager;
        }

        [UnitOfWork]
        public async Task AuthorizeAsync(
            bool requireAll,
            string permissionedObject,
            string method,
            string objectType,
            bool isAuthenticated,
            RefListPermissionedAccess? defaultAccess = null,
            List<string>? defaultPermissions = null
            )
        {
            if (!_authConfiguration.IsEnabled)
                return;

            var methodName = PermissionedObjectManager.GetCrudMethod(method, method);
            var permissionName = $"{permissionedObject}@{methodName}";

            var permission = await _permissionedObjectManager.GetOrDefaultAsync(permissionName, objectType);
            if (permission == null)
                return;

            var useDefaults = defaultAccess != null && permission.ActualAccess == RefListPermissionedAccess.Inherited;
            var actualAccess = useDefaults ? defaultAccess : permission.ActualAccess;
            var actualPermissions = useDefaults && defaultAccess == RefListPermissionedAccess.RequiresPermissions
                ? defaultPermissions
                : permission.ActualPermissions;

            switch (actualAccess)
            {
                case RefListPermissionedAccess.AllowAnonymous:
                    return;
                case RefListPermissionedAccess.Disable:
                    ThrowNotFound();
                    return;
                case RefListPermissionedAccess.AnyAuthenticated:
                    {
                        EnsureAuthenticated(isAuthenticated);
                        return;
                    }
                case RefListPermissionedAccess.RequiresPermissions:
                    {
                        EnsureAuthenticated(isAuthenticated);
                        if (actualPermissions == null || !actualPermissions.Any())
                            ThrowAccessDenied();

                        // Note: requireAll is intentionally false — multiple permissions are OR'd (any single permission grants access)
                        await _permissionChecker.AuthorizeAsync(false, actualPermissions.ToArray());
                        return;
                    }
                default:
                    ThrowAccessDenied();
                    return;
            }
        }

        private void EnsureAuthenticated(bool isAuthenticated)
        {
            if (!isAuthenticated)
                throw new AbpAuthorizationException(
                    _localizationManager?.GetString(SheshaConsts.LocalizationSourceName, "CurrentUserDidNotLoginToTheApplication")
                    ?? "Current user did not login to the application!"
                );
        }

        [DoesNotReturn]
        private void ThrowAccessDenied()
        {
            throw new AbpAuthorizationException(
                _localizationManager?.GetString(SheshaConsts.LocalizationSourceName, "AccessDenied") ?? "Access Denied"
            );
        }

        [DoesNotReturn]
        private void ThrowNotFound()
        {
            throw new EntityNotFoundException(
                _localizationManager?.GetString(SheshaConsts.LocalizationSourceName, "NotFound") ?? "Not found"
            );
        }
    }
}
