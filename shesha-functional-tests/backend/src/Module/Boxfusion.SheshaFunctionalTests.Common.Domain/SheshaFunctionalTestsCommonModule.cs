using Abp.AspNetCore.Configuration;
using Abp.AutoMapper;
using Abp.Modules;
using Boxfusion.SheshaFunctionalTests.Common.Domain.Configuration;
using Intent.RoslynWeaver.Attributes;
using Shesha;
using Shesha.Modules;
using Shesha.Settings.Ioc;
using System.Reflection;

[assembly: DefaultIntentManaged(Mode.Fully)]
[assembly: IntentTemplate("Boxfusion.Modules.Domain.Module", Version = "1.0")]

namespace Boxfusion.SheshaFunctionalTests.Common
{
    /// <summary>
    /// SheshaFunctionalTestsCommon Module
    /// </summary>
    [DependsOn(
        typeof(SheshaCoreModule),
        typeof(SheshaApplicationModule)
    )]
    public class SheshaFunctionalTestsCommonModule : SheshaModule
    {
        public override SheshaModuleInfo ModuleInfo => new SheshaModuleInfo("Boxfusion.SheshaFunctionalTests.Common")
        {
            FriendlyName = "Shesha Functional Tests Common",
            Publisher = "Boxfusion",
            Alias = "functionalTests"
        };

        /// inheritedDoc
        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(Assembly.GetExecutingAssembly());

            var thisAssembly = Assembly.GetExecutingAssembly();
            IocManager.RegisterAssemblyByConvention(thisAssembly);

            Configuration.Modules.AbpAutoMapper().Configurators.Add(
                // Scan the assembly for classes which inherit from AutoMapper.Profile
                cfg => cfg.AddMaps(thisAssembly)
            );
        }

        /// inheritedDoc
        public override void PreInitialize()
        {
            base.PreInitialize();

            IocManager.RegisterSettingAccessor<ITestSetting>(s => {
                s.UserLockoutItem.WithDefaultValue(100);
                s.TestComplexSetting.WithDefaultValue(new TestComplexSetting
                {
                    SomeNumber = 42,
                    SomeItem = "Hlayi is awesome",
                    IsSomething = true
                });
            });
        }

        /// inheritedDoc
        public override void PostInitialize()
        {
            Configuration.Modules.AbpAspNetCore().CreateControllersForAppServices(
                typeof(SheshaFunctionalTestsCommonModule).Assembly,
                moduleName: "SheshaFunctionalTestsCommon",
                useConventionalHttpVerbs: true);
        }
    }
}
