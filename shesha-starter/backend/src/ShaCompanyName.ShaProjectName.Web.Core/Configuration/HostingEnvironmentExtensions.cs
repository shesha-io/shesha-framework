using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Shesha.Configuration;

namespace ShaCompanyName.ShaProjectName.Configuration
{
    /// <summary>
    /// 
    /// </summary>
    public static class HostingEnvironmentExtensions
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="env"></param>
        /// <returns></returns>
        public static IConfigurationRoot GetAppConfiguration(this IHostingEnvironment env)
        {
            return AppConfigurations.Get(env.ContentRootPath, env.EnvironmentName, env.IsDevelopment());
        }
    }
}