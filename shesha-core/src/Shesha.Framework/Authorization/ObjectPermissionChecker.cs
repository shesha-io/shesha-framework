using Abp.Authorization;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Uow;
using Abp.Localization;
using Shesha.Domain.Enums;
using Shesha.Permissions;
using Shesha.Utilities;
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
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public ObjectPermissionChecker(
            IAuthorizationConfiguration authConfiguration,
            IPermissionedObjectManager permissionedObjectManager,
            IShaPermissionChecker permissionChecker,
            ILocalizationManager localizationManager,
            IUnitOfWorkManager unitOfWorkManager
        )
        {
            _authConfiguration = authConfiguration;
            _permissionedObjectManager = permissionedObjectManager;
            _permissionChecker = permissionChecker;
            _localizationManager = localizationManager;
            _unitOfWorkManager = unitOfWorkManager;
        }

        [UnitOfWork]
        public async Task AuthorizeAsync(
            bool requireAll,
            string permissionedObject,
            string method,
            string objectType,
            bool isAuthenticated,
            RefListPermissionedAccess? replaceInherited = null)
        {
            if (!_authConfiguration.IsEnabled)
                return;

            var methodName = PermissionedObjectManager.CrudMethods.ContainsKey(method) 
                ? PermissionedObjectManager.CrudMethods[method] 
                : method;
            var permissionName = $"{permissionedObject}@{methodName}";

            var permission = await _permissionedObjectManager.GetOrDefaultAsync(permissionName, objectType);
            if (permission == null)
                return;

            var actualAccess = replaceInherited != null && permission.ActualAccess == RefListPermissionedAccess.Inherited
                ? replaceInherited
                : permission.ActualAccess;

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
                    if (permission.ActualPermissions == null || !permission.ActualPermissions.Any())
                        ThrowAccessDenied();

                    // Note: requireAll is intentionally false — multiple permissions are OR'd (any single permission grants access)
                    await _permissionChecker.AuthorizeAsync(false, permission.ActualPermissions.ToArray());
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
