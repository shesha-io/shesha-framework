using Abp.Configuration.Startup;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
