using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Shesha.Application.Services;
using Shesha.Domain.Attributes;
using Shesha.Reflection;
using System;

namespace Shesha.DynamicEntities
{
    // Used to set the controller name for routing purposes. Without this convention the
    // names is 'GenericController`1[Widget]' rather than 'Widget'.
    //
    // Conventions can be applied as attributes or added to MvcOptions.Conventions.
    [AttributeUsage(AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
    public class DynamicControllerNameConvention : Attribute, IControllerModelConvention
    {
        public void Apply(ControllerModel controller)
        {
            // If not a GenericController - ignore.
            if (!AppServiceHelper.IsDynamicAppService(controller.ControllerType))
                return;

            var entityType = AppServiceHelper.GetEntityTypeFromDynamicAppService(controller.ControllerType);

            var entityAttribute = entityType.GetAttributeOrNull<EntityAttribute>();
            controller.ControllerName = !string.IsNullOrWhiteSpace(entityAttribute?.ApplicationServiceName)
                ? entityAttribute.ApplicationServiceName
                : entityType.Name + "Crud";
        }
    }
}
