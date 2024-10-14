using Abp.Dependency;
using ElmahCore;
using Microsoft.AspNetCore.Http;
using Shesha.Elmah.Exceptions;
using System.Threading.Tasks;

namespace Shesha.Elmah
{
    public class SheshaErrorContextMiddleware : IMiddleware, ISingletonDependency
    {
        private readonly ILoggingContextCollector _collector;

        public SheshaErrorContextMiddleware(ILoggingContextCollector collector)
        {
            _collector = collector;
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            try
            {
                using (_collector.BeginScope())
                {
                    await next(context);
                }
            }
            catch (WatchDogCleanupException e) 
            {
                ElmahExtensions.RaiseError(e);

                if (!context.Response.HasStarted)
                {
                    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                    context.Response.ContentType = "text/html";
                    await context.Response.WriteAsync(e.Message).ConfigureAwait(false);
                }
            }            
        }
    }
}
