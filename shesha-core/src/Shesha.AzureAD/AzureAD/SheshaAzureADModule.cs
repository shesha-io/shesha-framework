using Abp.Modules;
using Abp.Zero;
using Shesha.AzureAD.Configuration;
using System.Reflection;

namespace Shesha.AzureAD
{
    /// <summary>
    /// This module extends module zero to add LDAP authentication.
    /// </summary>
    [DependsOn(typeof(AbpZeroCommonModule))]
    public class SheshaAzureADModule : AbpModule
    {
        public override void PreInitialize()
        {
            IocManager.Register<ISheshaAzureADModuleConfig, SheshaAzureADModuleConfig>();

            //Configuration.Settings.Providers.Add<AzureADSettingProvider>();
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(Assembly.GetExecutingAssembly());
        }
    }
}
