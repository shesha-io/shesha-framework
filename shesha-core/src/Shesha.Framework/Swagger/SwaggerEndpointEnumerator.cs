using Shesha.Utilities;
using Swashbuckle.AspNetCore.SwaggerUI;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.Swagger
{
    public class SwaggerEndpointEnumerator : IEnumerable<UrlDescriptor>
    {
        public IEnumerator<UrlDescriptor> GetEnumerator()
        {
            var types = SwaggerHelper.ServiceTypesFunc();
            var serviceNames = types.Select(t => MvcHelper.GetControllerName(t)).OrderBy(s => s).ToList();
            foreach (var serviceName in serviceNames)
            {
                yield return new UrlDescriptor { Name = serviceName, Url = $"swagger/{SwaggerHelper.GetDocumentNameForService(serviceName)}/swagger.json" };
            }
        }

        IEnumerator IEnumerable.GetEnumerator() => this.GetEnumerator();
    }
}
