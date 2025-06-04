using Abp.Configuration.Startup;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Shesha.DynamicEntities;

namespace Shesha.Startup
{
    /// <summary>
    /// Defines extension methods to <see cref="IModuleConfigurations"/> to allow to configure ABP NHibernate module.
    /// </summary>
    public static class ShaApplicationConfigurationExtensions
    {
        /// <summary>
        /// Used to configure ABP NHibernate module.
        /// </summary>
        public static IShaApplicationModuleConfiguration ShaApplication(this IModuleConfigurations configurations)
        {
            return configurations.AbpConfiguration.Get<IShaApplicationModuleConfiguration>();
        }

        /// <summary>
        /// Allows to dynamically update the Web Api when changing dynamic Entity configurations. 
        /// !!! Should be before AddMvcCore !!!
        /// </summary>
        public static void UseDynamicWebApi(this IServiceCollection services)
        {
            services.AddSingleton<IActionDescriptorChangeProvider>(SheshaActionDescriptorChangeProvider.Instance);
            services.AddSingleton(SheshaActionDescriptorChangeProvider.Instance);
        }

    }
}
