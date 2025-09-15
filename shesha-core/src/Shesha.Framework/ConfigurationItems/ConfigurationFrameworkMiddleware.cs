using Abp.Dependency;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Configuration framework middleware
    /// </summary>
    public class ConfigurationFrameworkMiddleware : IMiddleware, ISingletonDependency
    {
        public const string FrontEndApplicationHeader = "sha-frontend-application";
        public const string TopLevelModuleHeader = "sha-top-level-module";

        private readonly IConfigurationFrameworkRuntime _cfRuntime;

        public ConfigurationFrameworkMiddleware(IConfigurationFrameworkRuntime cfRuntime)
        {
            _cfRuntime = cfRuntime;
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            var frontEndApp = context.Request.Headers.ContainsKey(FrontEndApplicationHeader)
                ? context.Request.Headers[FrontEndApplicationHeader].ToString()
                : null;

            var topLevelModule = context.Request.Headers.ContainsKey(TopLevelModuleHeader)
                ? context.Request.Headers[TopLevelModuleHeader].ToString()
                : null;            

            if (!string.IsNullOrEmpty(frontEndApp) || !string.IsNullOrWhiteSpace(topLevelModule))
            {
                using (_cfRuntime.BeginScope(a => 
                {

                    a.FrontEndApplication = string.IsNullOrWhiteSpace(frontEndApp)
                        ? FrontEndAppKeyConsts.SheshaDefaultFrontend 
                        : frontEndApp;
                    a.CurrentModule = topLevelModule;
                }))
                {
                    await next(context);
                }
            } else
                await next(context);
        }
    }
}