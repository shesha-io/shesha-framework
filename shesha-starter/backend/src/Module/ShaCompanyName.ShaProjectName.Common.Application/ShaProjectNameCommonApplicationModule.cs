using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.AutoMapper;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Shesha;
using Shesha.Modules;
using Shesha.Startup;
using Shesha.Web.FormsDesigner;
using System.Reflection;
using System.Threading.Tasks;

namespace ShaCompanyName.ShaProjectName.Common
{
    /// <summary>
    /// ShaProjectName Module
    /// </summary>
    [DependsOn(
        typeof(ShaProjectNameCommonModule),
        typeof(SheshaCoreModule),
        typeof(AbpAspNetCoreModule)
    )]
    public class ShaProjectNameCommonApplicationModule : SheshaSubModule<ShaProjectNameCommonModule>
    {
        public override async Task<bool> InitializeConfigurationAsync()
        {
            return await ImportConfigurationAsync();
        }
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

            Configuration.Modules.AbpAspNetCore()
                 .CreateControllersForAppServices(
                     typeof(SheshaFrameworkModule).GetAssembly()
                 );

            Configuration.Modules.AbpAspNetCore().CreateControllersForAppServices(
               typeof(ShaProjectNameCommonApplicationModule).Assembly,
               moduleName: "ShaProjectNameCommon",
                useConventionalHttpVerbs: true);

            Configuration.Modules.AbpAspNetCore()
                 .CreateControllersForAppServices(
                     typeof(ShaProjectNameCommonModule).GetAssembly()
                 );

            Configuration.Modules.AbpAspNetCore()
                 .CreateControllersForAppServices(
                     typeof(ShaProjectNameCommonApplicationModule).GetAssembly()
                 );
        }
    }
}
