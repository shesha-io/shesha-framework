using Abp;
using Abp.AspNetCore.Configuration;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Web.Api.ProxyScripting.Generators;
using Castle.Windsor.MsDependencyInjection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.Extensions.DependencyInjection;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Startup;
using Shesha.Utilities;
using System;
using System.Linq;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Dynamic controller route convention
    /// </summary>
    public class DynamicControllerRouteConvention : IControllerModelConvention
    {
        private readonly Lazy<IIocManager> _iocManager;

        private readonly Lazy<IShaApplicationModuleConfiguration> _shaConfig;

        public DynamicControllerRouteConvention(IServiceCollection services)
        {
            _iocManager = new Lazy<IIocManager>(() =>
            {
                return services
                    .GetSingletonService<AbpBootstrapper>()
                    .IocManager;
            }, true);

            _shaConfig = new Lazy<IShaApplicationModuleConfiguration>(() => _iocManager.Value.Resolve<IShaApplicationModuleConfiguration>());
        }

        public void Apply(ControllerModel controller)
        {
            if (controller.ControllerType.IsGenericType &&
                controller.ControllerType.GetGenericTypeDefinition() == typeof(DynamicCrudAppService<,,,,>))
            {
                var entityType = controller.ControllerType.GenericTypeArguments[0];

                controller.ControllerName = MvcHelper.GetControllerName(controller.ControllerType);

                var actionRouteProvider = _iocManager.Value.Resolve<IEntityActionRouteProvider>();

                foreach (var action in controller.Actions)
                {
                    var routeTemplate = actionRouteProvider.GetDynamicAppServiceRoute(entityType, action);
                    //var routeTemplate = $"api/services/{moduleName}/{controller.ControllerName}/{action.ActionName}";

                    foreach (var selector in action.Selectors) 
                    {
                        if (!selector.ActionConstraints.OfType<HttpMethodActionConstraint>().Any())
                        {
                            var httpMethod = ProxyScriptingHelper.GetConventionalVerbForMethodName(action.ActionName);
                            selector.ActionConstraints.Add(new HttpMethodActionConstraint(new[] { httpMethod }));
                        }

                        if (selector.AttributeRouteModel == null)
                        {
                            selector.AttributeRouteModel = new AttributeRouteModel(new RouteAttribute(routeTemplate));
                        }
                    }
                }
            }
        }
    }
}
