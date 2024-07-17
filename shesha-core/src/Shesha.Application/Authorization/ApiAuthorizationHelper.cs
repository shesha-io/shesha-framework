using Abp.Application.Features;
using Abp.Application.Services;
using Abp.Authorization;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Localization;
using Microsoft.AspNetCore.Mvc;
using Shesha.Extensions;
using Shesha.Permissions;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.Authorization
{
    public class ApiAuthorizationHelper : AuthorizationHelper, ISheshaAuthorizationHelper, ITransientDependency
    {

        private readonly IAuthorizationConfiguration _authConfiguration;
        private readonly IObjectPermissionChecker _objectPermissionChecker;

        public ApiAuthorizationHelper(
            IFeatureChecker featureChecker,
            IAuthorizationConfiguration authConfiguration,
            IObjectPermissionChecker objectPermissionChecker,
            ILocalizationManager localizationManager
            ): base(featureChecker, authConfiguration)
        {
            _authConfiguration = authConfiguration;
            _objectPermissionChecker = objectPermissionChecker;
        }

        public override async Task AuthorizeAsync(MethodInfo methodInfo, Type type)
        {
            if (!_authConfiguration.IsEnabled)
            {
                return;
            }

            var shaServiceType = typeof(ApplicationService);
            var controllerType = typeof(ControllerBase);
            if (type == null || !shaServiceType.IsAssignableFrom(type) && !controllerType.IsAssignableFrom(type))
                return;

            var typeName = type.FullName;

            var isCrud = type.FindBaseGenericType(typeof(AbpCrudAppService<,,,,,>)) != null;
            if (isCrud && PermissionedObjectManager.CrudMethods.ContainsKey(methodInfo.Name.RemovePostfix("Async")))
                return;

            // ToDo: add RequireAll flag
            await _objectPermissionChecker.AuthorizeAsync(
                false,
                typeName,
                methodInfo.Name,
                ShaPermissionedObjectsTypes.WebApiAction,
                AbpSession.UserId.HasValue,
                Domain.Enums.RefListPermissionedAccess.AllowAnonymous
            );
        }
    }
}