using Abp.AspNetCore.Configuration;
using Abp.Dependency;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Shesha.Reflection;
using System;

namespace Shesha.DynamicEntities
{
    public class DefaultEntityActionRouteProvider : IEntityActionRouteProvider, ITransientDependency
    {
        public string GetDynamicAppServiceRoute(Type entityType, ActionModel action)
        {
            var moduleName = GetConfigurableModuleName(entityType) ?? AbpControllerAssemblySetting.DefaultServiceModuleName;

            var routeTemplate = $"api/dynamic/{moduleName}/{action.Controller.ControllerName}/{action.ActionName}";
            return routeTemplate;
        }

        private string GetConfigurableModuleName(Type entityType)
        {
            return entityType.GetConfigurableModuleName();
        }
    }
}
