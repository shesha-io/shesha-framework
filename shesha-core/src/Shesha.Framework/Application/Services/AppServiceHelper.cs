using System;
using System.Linq;

namespace Shesha.Application.Services
{
    public static class AppServiceHelper
    {
        /// <summary>
        /// Returns true if provided type is a dynamic application service
        /// </summary>
        /// <param name="controllerType"></param>
        /// <returns></returns>
        public static bool IsDynamicAppService(Type controllerType)
        {
            var genericInterface = GetDynamicCrudAppServiceInterfaceOrNull(controllerType);
            
            return genericInterface != null && controllerType.IsGenericType;
        }

        /// <summary>
        /// Returns entity type from dynamic application service
        /// </summary>
        public static Type GetEntityTypeFromDynamicAppService(Type dynamicControllerType)
        {
            var genericInterface = GetDynamicCrudAppServiceInterfaceOrNull(dynamicControllerType);
            if (genericInterface == null)
                throw new ArgumentException($"Type {dynamicControllerType.Name} is not a dynamic application service type", nameof(dynamicControllerType));

            return genericInterface.GenericTypeArguments[0];
        }
        private static Type? GetDynamicCrudAppServiceInterfaceOrNull(Type controllerType)
        {
            return controllerType.GetInterfaces().FirstOrDefault(x => x.IsGenericType && x.GetGenericTypeDefinition() == typeof(IDynamicCrudAppService<,,>));
        }
    }
}
