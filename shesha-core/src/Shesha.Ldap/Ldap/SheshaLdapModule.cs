using System.Reflection;
using Abp.Localization.Dictionaries.Xml;
using Abp.Localization.Sources;
using Abp.Modules;
using Abp.Zero;
using Abp.AspNetCore.Configuration;
using Shesha.Ldap.Configuration;
using Abp.AspNetCore;

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

            Configuration.Localization.Sources.Extensions.Add(
                new LocalizationSourceExtensionInfo(
                    AbpZeroConsts.LocalizationSourceName,
                    new XmlEmbeddedFileLocalizationDictionaryProvider(
                        Assembly.GetExecutingAssembly(),
                        "Shesha.Ldap.Localization.Source")
                )
            );

            Configuration.Settings.Providers.Add<LdapSettingProvider>();

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
