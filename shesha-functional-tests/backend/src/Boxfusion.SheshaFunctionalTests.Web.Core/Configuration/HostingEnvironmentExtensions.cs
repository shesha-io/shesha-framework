using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Shesha.Configuration;

namespace Boxfusion.SheshaFunctionalTests.Configuration
{
    public static class HostingEnvironmentExtensions
    {
        public static IConfigurationRoot GetAppConfiguration(this IHostingEnvironment env)
        {
            return AppConfigurations.Get(env.ContentRootPath, env.EnvironmentName, env.IsDevelopment());
        }
    }
}
