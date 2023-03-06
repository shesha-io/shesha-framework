using Abp.AspNetCore.Configuration;
using Abp.AutoMapper;
using Abp.Modules;
using Intent.RoslynWeaver.Attributes;
using Shesha;
using Shesha.Modules;
using System.Reflection;

[assembly: DefaultIntentManaged(Mode.Fully)]
[assembly: IntentTemplate("Boxfusion.Modules.Domain.Module", Version = "1.0")]

namespace ShaCompanyName.ShaProjectName.Common
{
    /// <summary>
    /// ShaProjectNameCommon Module
    /// </summary>
    [DependsOn(
        typeof(SheshaCoreModule),
        typeof(SheshaApplicationModule)
    )]
    public class ShaProjectNameCommonModule : SheshaModule
    {
        public override SheshaModuleInfo ModuleInfo => new SheshaModuleInfo("ShaCompanyName.ShaProjectName")
        {
            FriendlyName = "ShaProjectName",
            Publisher = "ShaCompanyName",
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
        }

        /// inheritedDoc
        public override void PostInitialize()
        {
            Configuration.Modules.AbpAspNetCore().CreateControllersForAppServices(
                typeof(ShaProjectNameCommonModule).Assembly,
                moduleName: "ShaProjectNameCommon",
                useConventionalHttpVerbs: true);
        }
    }
}