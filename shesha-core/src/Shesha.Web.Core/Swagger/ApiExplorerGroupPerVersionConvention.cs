using System.Linq;
using Microsoft.AspNetCore.Mvc.ApplicationModels;

namespace Shesha.Swagger
{
    public class ApiExplorerGroupPerVersionConvention : IControllerModelConvention
    {
        public void Apply(ControllerModel controller)
        {
            var name = controller.ControllerType.Name;
            controller.ApiExplorer.GroupName = controller.ControllerType.Name;
        }
    }
}
