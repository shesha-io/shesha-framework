using Abp.Configuration.Startup;

namespace Shesha.AzureAD.Configuration
{
    /// <summary>
    /// Extension methods for module zero configurations.
    /// </summary>
    public static class SheshaAzureADConfigurationExtensions
    {
        /// <summary>
        /// Configures Shesha AzureAD module.
        /// </summary>
        /// <returns></returns>
        public static ISheshaAzureADModuleConfig SheshaAzureAD(this IModuleConfigurations moduleConfigurations)
        {
            return moduleConfigurations.AbpConfiguration.Get<ISheshaAzureADModuleConfig>();
        }
    }
}
