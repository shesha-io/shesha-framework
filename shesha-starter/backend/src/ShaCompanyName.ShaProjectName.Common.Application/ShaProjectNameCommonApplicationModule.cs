using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.AutoMapper;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Shesha;
using Shesha.Startup;
using Shesha.Web.FormsDesigner;
using System.Reflection;

namespace ShaCompanyName.ShaProjectName.Common
{
    /// <summary>
    /// ShaProjectName Module
    /// </summary>
    [DependsOn(
        typeof(ShaProjectNameCommonDomainModule),
        typeof(SheshaCoreModule),
        typeof(AbpAspNetCoreModule)
    )]
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

            //Configuration.Settings.Providers.Add<ShaProjectNameDomainSettingProvider>();
            //Configuration.Authorization.Providers.Add<ShaProjectNameAuthorizationProvider>();        // Initiatlisation handled within Web project

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

            Configuration.Modules.ShaApplication().CreateAppServicesForEntities(typeof(ShaProjectNameCommonDomainModule).Assembly, "Common");
            Configuration.Modules.AbpAspNetCore().CreateControllersForAppServices(
                typeof(ShaProjectNameCommonDomainModule).Assembly,
                moduleName: "Common",
                useConventionalHttpVerbs: true);

            Configuration.Modules.AbpAspNetCore().CreateControllersForAppServices(
                assembly: typeof(ShaProjectNameCommonApplicationModule).Assembly,
                moduleName: "Common",
                useConventionalHttpVerbs: true);

            Configuration.Modules.AbpAspNetCore()
                 .CreateControllersForAppServices(
                     typeof(SheshaFormsDesignerModule).GetAssembly()
                 );
        }
    }
}
