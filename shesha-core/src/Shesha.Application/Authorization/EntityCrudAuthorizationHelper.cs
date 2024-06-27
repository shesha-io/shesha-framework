using Abp.Application.Features;
using Abp.Application.Services;
using Abp.Authorization;
using Abp.Configuration.Startup;
using Abp.Dependency;
using Abp.Localization;
using Microsoft.AspNetCore.Mvc;
using Shesha.DynamicEntities.Cache;
using Shesha.Extensions;
using Shesha.Permissions;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.Authorization
{
    public class EntityCrudAuthorizationHelper : AuthorizationHelper, ISheshaAuthorizationHelper, ITransientDependency
    {

        private readonly IAuthorizationConfiguration _authConfiguration;
        private readonly IObjectPermissionChecker _objectPermissionChecker;
        private readonly IEntityConfigCache _entityConfigCache;

        public EntityCrudAuthorizationHelper(
            IFeatureChecker featureChecker,
            IAuthorizationConfiguration authConfiguration,
            IObjectPermissionChecker objectPermissionChecker,
            IEntityConfigCache entityConfigCache,
            ILocalizationManager localizationManager
            ): base(featureChecker, authConfiguration)
        {
            _entityConfigCache = entityConfigCache;
            _authConfiguration = authConfiguration;
            _objectPermissionChecker = objectPermissionChecker;
        }

        public override async Task AuthorizeAsync(MethodInfo methodInfo, Type type)
        {
            if (!_authConfiguration.IsEnabled)
            {
                return;
            }

            var method = PermissionedObjectManager.CrudMethods.ContainsKey(methodInfo.Name.RemovePostfix("Async")) 
                ? PermissionedObjectManager.CrudMethods[methodInfo.Name.RemovePostfix("Async")] 
                : null;
            // It is not a Crud method
            if (method == null) return;

            var shaServiceType = typeof(ApplicationService);
            var controllerType = typeof(ControllerBase);
            if (type == null || !shaServiceType.IsAssignableFrom(type) && !controllerType.IsAssignableFrom(type))
                return;

            var entityType = type.FindBaseGenericType(typeof(AbpCrudAppService<,,,,,>))?.GetGenericArguments()?[0];

            // It is not an entity Crud Api
            if (entityType == null || !Abp.Domain.Entities.EntityHelper.IsEntity(entityType)) return;

            /*var isDynamic = type.GetInterfaces().Any(x =>
                x.IsGenericType &&
                x.GetGenericTypeDefinition() == typeof(IDynamicCrudAppService<,,>));*/

            var config = AsyncHelper.RunSync(() => _entityConfigCache.GetEntityConfigAsync(entityType));

            if (config == null) return;

            //if (!config.GenerateAppService)
            //{
            //    throw new AbpAuthorizationException($"Service for entity type `{config.FullClassName}` is not configured");
            //}

            // ToDo: add RequireAll flag
            await _objectPermissionChecker.AuthorizeAsync(false, config.FullClassName, method, AbpSession.UserId.HasValue);
        }
    }
}