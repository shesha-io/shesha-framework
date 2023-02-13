using System.Reflection;
using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.AutoMapper;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Intent.RoslynWeaver.Attributes;
using Shesha;
using Shesha.Startup;
using Shesha.Web.FormsDesigner;

[assembly: DefaultIntentManaged(Mode.Fully)]
[assembly: IntentTemplate("Boxfusion.Modules.Application.Services.AppService", Version = "1.0")]

namespace ShaCompanyName.ShaProjectName.Common
{
    /// <summary>
    /// ShaProjectNameCommon Module
    /// </summary>
    [DependsOn(
        typeof(SheshaCoreModule),
        typeof(SheshaApplicationModule),
        typeof(ShaProjectNameCommonModule),
        typeof(AbpAspNetCoreModule)
    )]
    [IntentManaged(Mode.Ignore)]
    public class ShaProjectNameCommonApplicationModule : AbpModule
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

            Configuration.Modules.ShaApplication().CreateAppServicesForEntities(typeof(SheshaCoreModule).Assembly, "Core");
            Configuration.Modules.AbpAspNetCore()
                 .CreateControllersForAppServices(
                     typeof(SheshaCoreModule).GetAssembly()
                 );

            Configuration.Modules.ShaApplication().CreateAppServicesForEntities(typeof(SheshaApplicationModule).Assembly, "App");
            Configuration.Modules.AbpAspNetCore()
                 .CreateControllersForAppServices(
                     typeof(SheshaApplicationModule).GetAssembly()
                 );

            Configuration.Modules.ShaApplication().CreateAppServicesForEntities(typeof(SheshaFormsDesignerModule).Assembly, "App");
            Configuration.Modules.AbpAspNetCore()
                 .CreateControllersForAppServices(
                     typeof(SheshaFormsDesignerModule).GetAssembly()
                 );

            Configuration.Modules.ShaApplication().CreateAppServicesForEntities(typeof(SheshaFrameworkModule).Assembly, "Shesha");
            Configuration.Modules.AbpAspNetCore()
                 .CreateControllersForAppServices(
                     typeof(SheshaFrameworkModule).GetAssembly()
                 );

            Configuration.Modules.AbpAspNetCore().CreateControllersForAppServices(
               typeof(ShaProjectNameCommonApplicationModule).Assembly,
               moduleName: "ShaProjectNameCommon",
                useConventionalHttpVerbs: true);

            Configuration.Modules.ShaApplication().CreateAppServicesForEntities(
                typeof(ShaProjectNameCommonModule).Assembly,
                moduleName: "ShaProjectNameCommon");

            Configuration.Modules.AbpAspNetCore()
                 .CreateControllersForAppServices(
                     typeof(ShaProjectNameCommonModule).GetAssembly()
                 );

            Configuration.Modules.ShaApplication().CreateAppServicesForEntities(
                assembly: typeof(ShaProjectNameCommonApplicationModule).Assembly,
                moduleName: "ShaProjectNameCommon");

            Configuration.Modules.AbpAspNetCore()
                 .CreateControllersForAppServices(
                     typeof(ShaProjectNameCommonApplicationModule).GetAssembly()
                 );
        }
    }
}