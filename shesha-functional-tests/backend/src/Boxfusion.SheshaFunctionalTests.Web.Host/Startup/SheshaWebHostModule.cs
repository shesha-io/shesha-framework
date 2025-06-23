using Abp.AutoMapper;
using Abp.Hangfire;
using Abp.Hangfire.Configuration;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Shesha.Modules;

namespace Boxfusion.SheshaFunctionalTests.Web.Host.Startup
{
    [DependsOn(typeof(SheshaFunctionalTestsWebCoreModule),
        typeof(AbpHangfireAspNetCoreModule))]
    public class SheshaWebHostModule: SheshaSubModule<SheshaFunctionalTestsWebCoreModule>
    {
        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(SheshaWebHostModule).GetAssembly());
        }
        public override void PreInitialize()
        {
            Configuration.BackgroundJobs.UseHangfire();
        }
    }
}
