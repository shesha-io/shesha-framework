using Abp.Configuration.Startup;

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
    }
}
