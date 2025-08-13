using Abp.Dependency;
using Microsoft.AspNetCore.Http;
using Shesha.ConfigurationItems.Models;
using System;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Configuration framework middleware
    /// </summary>
    public class ConfigurationFrameworkMiddleware : IMiddleware, ISingletonDependency
    {
        public const string ConfigItemModeHeader = "sha-config-item-mode";
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

            context.Request.Headers.TryGetValue(ConfigItemModeHeader, out var modeStr);
            var configItemMode = Enum.TryParse(modeStr, true, out ConfigurationItemViewMode myStatus)
                ? myStatus
                : (ConfigurationItemViewMode?)null;

            if (configItemMode.HasValue || !string.IsNullOrEmpty(frontEndApp) || !string.IsNullOrWhiteSpace(topLevelModule))
            {
                using (_cfRuntime.BeginScope(a => 
                {

                    a.ViewMode = configItemMode.HasValue
                        ? configItemMode.Value
                        : ConfigurationItemViewMode.Live;
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