using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.AutoMapper;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Intent.RoslynWeaver.Attributes;
using Shesha;
using Shesha.Modules;
using Shesha.Web.FormsDesigner;
using System.Reflection;

[assembly: DefaultIntentManaged(Mode.Fully)]
[assembly: IntentTemplate("Boxfusion.Modules.Application.Services.AppService", Version = "1.0")]

namespace Boxfusion.SheshaFunctionalTests.Common
{
    /// <summary>
    /// SheshaFunctionalTestsCommon Module
    /// </summary>
    [DependsOn(
        typeof(SheshaCoreModule),
        typeof(SheshaApplicationModule),
        typeof(SheshaFunctionalTestsCommonModule),
        typeof(AbpAspNetCoreModule)
    )]
    [IntentManaged(Mode.Ignore)]
    public class SheshaFunctionalTestsCommonApplicationModule : SheshaSubModule<SheshaFunctionalTestsCommonModule>
    {
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

            Configuration.Modules.AbpAspNetCore()
                 .CreateControllersForAppServices(
                     typeof(SheshaCoreModule).GetAssembly()
                 );

            Configuration.Modules.AbpAspNetCore()
                 .CreateControllersForAppServices(
                     typeof(SheshaApplicationModule).GetAssembly()
                 );

            Configuration.Modules.AbpAspNetCore()
                 .CreateControllersForAppServices(
                     typeof(SheshaFormsDesignerModule).GetAssembly()
                 );

            Configuration.Modules.AbpAspNetCore().CreateControllersForAppServices(
               typeof(SheshaFunctionalTestsCommonApplicationModule).Assembly,
               moduleName: "SheshaFunctionalTestsCommon",
                useConventionalHttpVerbs: true);

            Configuration.Modules.AbpAspNetCore()
                 .CreateControllersForAppServices(
                     typeof(SheshaFunctionalTestsCommonModule).GetAssembly()
                 );

            Configuration.Modules.AbpAspNetCore()
                 .CreateControllersForAppServices(
                     typeof(SheshaFunctionalTestsCommonApplicationModule).GetAssembly()
                 );
        }
    }
}