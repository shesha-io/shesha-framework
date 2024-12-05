using Abp.Application.Features;
using Abp.Application.Services;
using Abp.Authorization;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Localization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shesha.Configuration.Security;
using Shesha.Extensions;
using Shesha.Permissions;
using Shesha.Reflection;
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
        private readonly ISecuritySettings _securitySettings;

        public ApiAuthorizationHelper(
            IFeatureChecker featureChecker,
            IAuthorizationConfiguration authConfiguration,
            IObjectPermissionChecker objectPermissionChecker,
            ILocalizationManager localizationManager,
            ISecuritySettings securitySettings
            ) : base(featureChecker, authConfiguration)
        {
            _authConfiguration = authConfiguration;
            _objectPermissionChecker = objectPermissionChecker;
            _securitySettings = securitySettings;
        }

        public override async Task AuthorizeAsync(MethodInfo methodInfo, Type type)
        {
            if (!_authConfiguration.IsEnabled)
            {
                return;
            }

            if (type.HasAttribute<AllowAnonymousAttribute>() || methodInfo.HasAttribute<AllowAnonymousAttribute>())
                return;

            var shaServiceType = typeof(ApplicationService);
            var controllerType = typeof(ControllerBase);
            if (type == null || !shaServiceType.IsAssignableFrom(type) && !controllerType.IsAssignableFrom(type))
                return;

            var typeName = type.FullName;
            var methodName = methodInfo.Name.RemovePostfix("Async");

            var isCrud = type.FindBaseGenericType(typeof(AbpCrudAppService<,,,,,>)) != null;
            if (isCrud && PermissionedObjectManager.CrudMethods.ContainsKey(methodName))
                return;

            // ToDo: add RequireAll flag
            await _objectPermissionChecker.AuthorizeAsync(
                false,
                typeName,
                methodName,
                ShaPermissionedObjectsTypes.WebApiAction,
                AbpSession.UserId.HasValue,
                _securitySettings.SecuritySettings.GetValue().DefaultEndpointAccess
            );
        }
    }
}