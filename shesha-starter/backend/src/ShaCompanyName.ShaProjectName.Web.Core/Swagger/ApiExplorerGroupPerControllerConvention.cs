using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.AspNetCore.Mvc.Controllers;
using Shesha.Utilities;

namespace ShaCompanyName.ShaProjectName.Swagger
{
    /// <summary>
    /// 
    /// </summary>
    public class ApiExplorerGroupPerControllerConvention : IControllerModelConvention
    {
        private const char Delimiter = ':';
        private const string ServicePrefix = "service:";

        /// <summary>
        /// 
        /// </summary>
        /// <param name="controller"></param>
        public void Apply(ControllerModel controller)
        {
            controller.ApiExplorer.GroupName = controller.ControllerType.Name;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="docName"></param>
        /// <param name="apiDescription"></param>
        /// <returns></returns>
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
