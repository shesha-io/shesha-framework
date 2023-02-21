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
        typeof(ShaProjectNameCommonModule),
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

            Configuration.Modules.AbpAspNetCore().CreateControllersForAppServices(
                typeof(ShaProjectNameCommonModule).Assembly,
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
