using Abp.Collections;
using Abp.Configuration.Startup;
using Abp.MultiTenancy;

namespace Shesha.Session
{
    /// <summary>
    /// Empty implementation of <see cref="IMultiTenancyConfig"/>.
    /// </summary>
    public class NullMultiTenancyConfig : IMultiTenancyConfig
    {
        /// <summary>
        /// Is multi-tenancy enabled?
        /// Default value: false.
        /// </summary>
        public bool IsEnabled { get; set; }

        /// <summary>
        /// Ignore feature check for host users
        /// Default value: false.
        /// </summary>
        public bool IgnoreFeatureCheckForHostUsers { get; set; }

        public ITypeList<ITenantResolveContributor> Resolvers { get; }

        public string TenantIdResolveKey { get; set; }

        public NullMultiTenancyConfig()
        {
            Resolvers = new TypeList<ITenantResolveContributor>();
            TenantIdResolveKey = "Abp-TenantId";
        }
    }
}
