using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.AspNetCore.Mvc.Controllers;
using Shesha.Utilities;

namespace ShaCompanyName.ShaProjectName.Swagger
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
                var serviceName = docName.RemovePrefix(ServicePrefix);

                if (apiDescription.ActionDescriptor is ControllerActionDescriptor actionDesc)
                {
                    return actionDesc.ControllerName == serviceName;
                }
            }

            return true;
        }
    }
}
