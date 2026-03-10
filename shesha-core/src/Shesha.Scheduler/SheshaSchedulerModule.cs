using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.AutoMapper;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Shesha.Modules;
using Shesha.NHibernate;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.Scheduler
{
    [DependsOn(typeof(SheshaNHibernateModule), typeof(AbpAspNetCoreModule))]
    public class SheshaSchedulerModule : SheshaSubModule<SheshaFrameworkModule>
    {
        /// inheritedDoc
        public override void Initialize()
        {
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
            Configuration.Modules.AbpAspNetCore().CreateControllersForAppServices(
                typeof(SheshaSchedulerModule).GetAssembly(),
                moduleName: "Scheduler",
                useConventionalHttpVerbs: true);
        }

        public override async Task<bool> InitializeConfigurationAsync()
        {
            return await ImportConfigurationAsync();
        }
    }
}
