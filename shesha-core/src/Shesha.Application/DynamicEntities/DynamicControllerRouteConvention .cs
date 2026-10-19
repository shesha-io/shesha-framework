using Abp;
using Abp.Dependency;
using Abp.Web.Api.ProxyScripting.Generators;
using Castle.Windsor.MsDependencyInjection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.Extensions.DependencyInjection;
using Shesha.Application.Services;
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

        public DynamicControllerRouteConvention(IServiceCollection services)
        {
            _iocManager = new Lazy<IIocManager>(() =>
            {
                return services
                    .GetSingletonService<AbpBootstrapper>()
                    .IocManager;
            }, true);
        }

        public void Apply(ControllerModel controller)
        {
            if (AppServiceHelper.IsDynamicAppService(controller.ControllerType))
            {
                var entityType = AppServiceHelper.GetEntityTypeFromDynamicAppService(controller.ControllerType);

                controller.ControllerName = MvcHelper.GetControllerName(controller.ControllerType);

                var actionRouteProvider = _iocManager.Value.Resolve<IEntityActionRouteProvider>();

                foreach (var action in controller.Actions)
                {
                    var routeTemplate = actionRouteProvider.GetDynamicAppServiceRoute(entityType, action);

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
