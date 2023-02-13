using System.Reflection;
using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.Dependency;
using Abp.Localization.Dictionaries.Xml;
using Abp.Localization.Sources;
using Abp.Modules;
using Abp.Zero;
using Shesha.Firebase;
using Shesha.Firebase.Configuration;

namespace Shesha
{
    /// <summary>
    /// This module extends module zero to add Firebase notifications.
    /// </summary>
    [DependsOn(typeof(AbpZeroCommonModule), typeof(AbpAspNetCoreModule))]
    public class SheshaFirebaseModule : AbpModule
    {
        public override void PreInitialize()
        {
            Configuration.Localization.Sources.Extensions.Add(
                new LocalizationSourceExtensionInfo(
                    AbpZeroConsts.LocalizationSourceName,
                    new XmlEmbeddedFileLocalizationDictionaryProvider(
                        Assembly.GetExecutingAssembly(),
                        "Shesha.Ldap.Localization.Source")
                )
            );

            Configuration.Settings.Providers.Add<FirebaseSettingProvider>();

            Configuration.Modules.AbpAspNetCore().CreateControllersForAppServices(
                this.GetType().Assembly,
                moduleName: "SheshaFirebase",
                useConventionalHttpVerbs: true);
        }

        public override void Initialize()
        {
            IocManager.Register<FirebaseAppService, FirebaseAppService>(DependencyLifeStyle.Transient);

            IocManager.RegisterAssemblyByConvention(Assembly.GetExecutingAssembly());
        }
    }
}
