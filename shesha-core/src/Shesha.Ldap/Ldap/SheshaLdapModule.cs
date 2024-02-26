using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.Modules;
using Abp.Zero;
using Shesha.Ldap.Configuration;
using Shesha.Modules;
using Shesha.Settings.Ioc;
using System.Reflection;

namespace Shesha.Ldap
{
    /// <summary>
    /// This module extends module zero to add LDAP authentication.
    /// </summary>
    [DependsOn(typeof(AbpZeroCommonModule), typeof(AbpAspNetCoreModule))]
    public class SheshaLdapModule : SheshaModule
    {
        public const string ModuleName = "Shesha.Ldap";
        public override SheshaModuleInfo ModuleInfo => new SheshaModuleInfo(ModuleName)
        {
            FriendlyName = "Shesha LDAP",
            Publisher = "Shesha",
#if DisbleEditModule
            IsEditable = false,
#endif
        };

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
            IocManager.RegisterSettingAccessor<ILdapSettings>(s => {
                s.Port.WithDefaultValue(389);
            });

            IocManager.RegisterAssemblyByConvention(Assembly.GetExecutingAssembly());
        }
    }
}
