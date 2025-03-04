﻿using Abp.Authorization;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Uow;
using Abp.Localization;
using Shesha.Domain.Enums;
using Shesha.Permissions;
using Shesha.Utilities;
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
            bool IsAuthenticated,
            RefListPermissionedAccess? replaceInherited = null)
        {
            if (!_authConfiguration.IsEnabled)
            {
                return;
            }

            var methodName = PermissionedObjectManager.GetCrudMethod(method, method);
            var permissionName = $"{permissionedObject}@{methodName}";

            var permission = await _permissionedObjectManager.GetOrDefaultAsync(permissionName, objectType);

            var actualAccess = replaceInherited != null && permission?.ActualAccess == RefListPermissionedAccess.Inherited
                ? replaceInherited
                : permission?.ActualAccess;

            if (permission == null
                || actualAccess == RefListPermissionedAccess.AllowAnonymous
                || actualAccess == RefListPermissionedAccess.AnyAuthenticated && IsAuthenticated)
                return;

            if (!IsAuthenticated)
            {
                throw new AbpAuthorizationException(
                    _localizationManager?.GetString(SheshaConsts.LocalizationSourceName, "CurrentUserDidNotLoginToTheApplication") 
                    ?? "Current user did not login to the application!"
                );
            }
            if (actualAccess == RefListPermissionedAccess.Disable)
            {
                throw new EntityNotFoundException(
                    _localizationManager?.GetString(SheshaConsts.LocalizationSourceName, "NotFound") ?? "Not found"
                );
            }
            if (actualAccess == RefListPermissionedAccess.RequiresPermissions
                && (permission.ActualPermissions == null || !permission.ActualPermissions.Any())
            )
            {
                throw new AbpAuthorizationException(
                    _localizationManager?.GetString(SheshaConsts.LocalizationSourceName, "AccessDenied") ?? "Access Denied"
                );
            }

            var ty = _permissionChecker.GetType();// (_permissionChecker as IProxyTargetAccessor).DynProxyGetTarget().GetType();
            // ToDo: add RequireAll flag
            await _permissionChecker.AuthorizeAsync(false, permission.ActualPermissions?.ToArray());
        }
    }
}
