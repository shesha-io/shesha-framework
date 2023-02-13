using Microsoft.AspNetCore.Mvc.ApplicationModels;
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
            if (!controller.ControllerType.IsGenericType || controller.ControllerType.GetGenericTypeDefinition() !=
                typeof(DynamicCrudAppService<,,>))
            {
                // Not a GenericController, ignore.
                return;
            }

            var entityType = controller.ControllerType.GenericTypeArguments[0];

            var entityAttribute = entityType.GetAttribute<EntityAttribute>();
            controller.ControllerName = !string.IsNullOrWhiteSpace(entityAttribute?.ApplicationServiceName)
                ? entityAttribute.ApplicationServiceName
                : entityType.Name;
        }
    }
}
