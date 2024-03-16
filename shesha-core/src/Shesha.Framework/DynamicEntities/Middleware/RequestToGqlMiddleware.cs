using Abp.Dependency;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities.Middleware
{
    public class RequestToGqlMiddleware : IMiddleware, ISingletonDependency
    {
        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            if (context.Request.Query.ContainsKey("properties")
                && context.Request.Path.Value != null)
            {
                if (context.Request.Path.Value.ToLower().Contains("crud/get"))
                    context.Request.Path =
                        new PathString(Regex.Replace(context.Request.Path.Value, "/Get", "/Query", RegexOptions.IgnoreCase));

                if (context.Request.Path.Value.ToLower().EndsWith("crud/create"))
                    context.Request.Path =
                        new PathString(Regex.Replace(context.Request.Path.Value, "/Create", "/Creategql", RegexOptions.IgnoreCase));

                if (context.Request.Path.Value.ToLower().EndsWith("crud/update")
                    && !context.Request.Path.Value.ToLower().Contains("crud/updategql"))
                    context.Request.Path =
                        new PathString(Regex.Replace(context.Request.Path.Value, "/Update", "/Updategql", RegexOptions.IgnoreCase));
            }

            await next(context);
        }
    }
}
