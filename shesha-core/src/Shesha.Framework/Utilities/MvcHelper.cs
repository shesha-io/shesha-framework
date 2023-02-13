using Abp.Extensions;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using System;
using System.Linq;
using System.Reflection;

namespace Shesha.Utilities
{
    public static class MvcHelper
    {
        private static string[] _standardPostfixes = new string[] { "Controller", "AppService", "ApplicationService", "Service" };

        /// <summary>
        /// Get controller name for specified <paramref name="controllerType"/>
        /// </summary>
        /// <param name="controllerType"></param>
        /// <returns></returns>
        public static string GetControllerName(Type controllerType)
        {
            var controllerConventions = controllerType.GetCustomAttributes().OfType<IControllerModelConvention>().ToList();
            var model = new ControllerModel(controllerType.GetTypeInfo(), controllerConventions)
            {
                ControllerName = controllerType.Name.RemovePostFix(_standardPostfixes)
            };            

            foreach (var controllerConvention in controllerConventions)
            {
                controllerConvention.Apply(model);
            }
            return model.ControllerName;
        }
    }
}
