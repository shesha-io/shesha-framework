using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.Modules;
using Abp.Zero;
using Shesha.Ldap.Configuration;
using System.Reflection;

namespace Shesha.Ldap
{
    /// <summary>
    /// This module extends module zero to add LDAP authentication.
    /// </summary>
    [DependsOn(typeof(AbpZeroCommonModule), typeof(AbpAspNetCoreModule))]
    public class SheshaLdapModule : AbpModule
    {
        public override void PreInitialize()
        {
            IocManager.Register<ISheshaLdapModuleConfig, SheshaLdapModuleConfig>();

            //Configuration.Settings.Providers.Add<LdapSettingProvider>();

            Configuration.Modules.AbpAspNetCore().CreateControllersForAppServices(
                this.GetType().Assembly,
                moduleName: "SheshaLdap",
                useConventionalHttpVerbs: true);
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(Assembly.GetExecutingAssembly());
        }
    }
}
