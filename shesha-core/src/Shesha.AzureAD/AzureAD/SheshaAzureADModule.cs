using System.Reflection;
using Abp.Localization.Dictionaries.Xml;
using Abp.Localization.Sources;
using Abp.Modules;
using Abp.Zero;
using Shesha.AzureAD.Configuration;

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

            Configuration.Localization.Sources.Extensions.Add(
                new LocalizationSourceExtensionInfo(
                    AbpZeroConsts.LocalizationSourceName,
                    new XmlEmbeddedFileLocalizationDictionaryProvider(
                        Assembly.GetExecutingAssembly(),
                        "Shesha.AzureAD.Localization.Source")
                )
            );

            Configuration.Settings.Providers.Add<AzureADSettingProvider>();
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(Assembly.GetExecutingAssembly());
        }
    }
}
