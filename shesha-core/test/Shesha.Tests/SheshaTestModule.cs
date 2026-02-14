using Abp;
using Abp.AspNetCore;
using Abp.Castle.Logging.Log4Net;
using Abp.Configuration;
using Abp.Modules;
using Abp.TestBase;
using Castle.Facilities.Logging;
using Shesha.Modules;
using Shesha.NHibernate;
using Shesha.Testing;
using Shesha.Tests.ModuleA;
using Shesha.Tests.ModuleB;
using Shesha.Web.FormsDesigner;
using System.Reflection;

namespace Shesha.Tests
{
    [DependsOn(

        typeof(AbpKernelModule),
        typeof(AbpTestBaseModule),
        typeof(AbpAspNetCoreModule),

        typeof(SheshaFormsDesignerModule),
        typeof(SheshaApplicationModule),
        typeof(SheshaFrameworkModule),
        typeof(SheshaNHibernateModule),
        typeof(SheshaTestsModuleA),
        typeof(SheshaTestsModuleB)
    )]
    public class SheshaTestModule : SheshaModule
    {
        public const string ModuleName = "Shesha.Tests";
        public override SheshaModuleInfo ModuleInfo => new SheshaModuleInfo(ModuleName)
        {
            FriendlyName = "Shesha Tests",
            Publisher = "Boxfusion",
            Alias = "shaTests",
            Hierarchy = [typeof(SheshaTestsModuleA), typeof(SheshaTestsModuleB), typeof(SheshaFrameworkModule)]
        };

        public SheshaTestModule(SheshaNHibernateModule nhModule, SheshaFrameworkModule frwkModule)
        {
            nhModule.SkipDbSeed = false;    // Set to false to apply DB Migration files on start up
            frwkModule.SkipAppWarmUp = true;
        }

        public override void PreInitialize()
        {
            this.ConfigureForTesting(IocManager, "appsettings.json");

            // Framework-specific: enable entity history for testing (ConfigureForTesting disables it)
            Configuration.EntityHistory.IsEnabled = true;
            Configuration.EntityHistory.Selectors.Add("Settings", typeof(Setting));
        }

        public override void Initialize()
        {
            var thisAssembly = Assembly.GetExecutingAssembly();
            IocManager.RegisterAssemblyByConvention(thisAssembly);

            IocManager.IocContainer.AddFacility<LoggingFacility>(f => f.UseAbpLog4Net().WithConfig("log4net.config"));
        }
    }
}
