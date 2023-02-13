using Abp.Configuration.Startup;
using Shesha.NHibernate.Configuration;

namespace Shesha.Configuration.Startup
{
    /// <summary>
    /// Defines extension methods to <see cref="IModuleConfigurations"/> to allow to configure ABP NHibernate module.
    /// </summary>
    public static class ShaNHibernateConfigurationExtensions
    {
        /// <summary>
        /// Used to configure ABP NHibernate module.
        /// </summary>
        public static IShaNHibernateModuleConfiguration ShaNHibernate(this IModuleConfigurations configurations)
        {
            return configurations.AbpConfiguration.Get<IShaNHibernateModuleConfiguration>();
        }
    }
}