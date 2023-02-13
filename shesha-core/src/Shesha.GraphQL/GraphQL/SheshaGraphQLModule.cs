using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.AutoMapper;
using Abp.Modules;
using Abp.Reflection.Extensions;

namespace Shesha.GraphQL
{
    [DependsOn(
        typeof(AbpAutoMapperModule),
        typeof(AbpAspNetCoreModule)
    )]
    public class SheshaGraphQLModule : AbpModule
    {
        public override void PreInitialize() 
        {
            Configuration.Modules.AbpAspNetCore().CreateControllersForAppServices(
                    this.GetType().Assembly,
                    moduleName: "Shesha",
                    useConventionalHttpVerbs: true);
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(SheshaGraphQLModule).GetAssembly());
        }
    }
}
