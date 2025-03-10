using Abp.Dependency;
using Microsoft.AspNetCore.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Middleware
{
    public class RequestToGqlMiddleware : IMiddleware, ISingletonDependency
    {
        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            var path = context.Request.Path.Value;
            if (context.Request.Query.ContainsKey("properties")
                && path != null)
            {
                if (path.ToLower().Contains("crud/get"))
                    context.Request.Path =
                        new PathString(Regex.Replace(path, "/Get", "/Query", RegexOptions.IgnoreCase));

                if (path.ToLower().EndsWith("crud/create"))
                    context.Request.Path =
                        new PathString(Regex.Replace(path, "/Create", "/Creategql", RegexOptions.IgnoreCase));

                if (path.ToLower().EndsWith("crud/update")
                    && !path.ToLower().Contains("crud/updategql"))
                    context.Request.Path =
                        new PathString(Regex.Replace(path, "/Update", "/Updategql", RegexOptions.IgnoreCase));
            }

            await next(context);
        }
    }
}
