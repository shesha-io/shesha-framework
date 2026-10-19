using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.AspNetCore.Mvc.Controllers;
using Shesha.Application.Services;
using Shesha.Reflection;
using System.Linq;

namespace Shesha.Swagger
{
    public class ApiExplorerGroupPerControllerConvention : IControllerModelConvention
    {
        private const char Delimiter = ':';
        private const string ServicePrefix = "service:";
        public void Apply(ControllerModel controller)
        {
            controller.ApiExplorer.GroupName = controller.ControllerType.Name;
        }

        public static bool GroupInclusionPredicate(string docName, ApiDescription apiDescription)
        {
            if (docName.StartsWith(ServicePrefix))
            {
                var parts = docName.Split(Delimiter);
                // get app service name
                var serviceName = parts.Length > 2 ? parts[2] : parts[1];
                // get assembly of entity if exist
                var assembly = parts.Length > 2 ? parts[1] : null;

                if (apiDescription.ActionDescriptor is ControllerActionDescriptor actionDesc)
                {
                    // if service is EntityAppService then
                    if (actionDesc.ControllerTypeInfo.ImplementsGenericInterface(typeof(IEntityAppService<,>)))
                    {
                        // get Entity
                        var entityType = actionDesc.ControllerTypeInfo.GetGenericInterfaces(typeof(IEntityAppService<,>)).FirstOrDefault()?.GetGenericArguments()[0];
                        // skip if Entity.Assembly not equal Service.Assembly
                        // this is necessary to group actions of Entities with the same names (but different Assemblies)
                        return actionDesc.ControllerName == serviceName && entityType?.Assembly.GetName().Name == assembly;
                    }
                    return actionDesc.ControllerName == serviceName;
                }
            }

            return true;
        }
    }
}
