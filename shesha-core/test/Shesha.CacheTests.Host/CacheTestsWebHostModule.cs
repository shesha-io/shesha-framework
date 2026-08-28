using Abp.Hangfire;
using Abp.Hangfire.Configuration;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Boxfusion.SheshaFunctionalTests;

namespace Shesha.CacheTests.Host
{
    /// <summary>
    /// Loads the same module graph as Boxfusion.SheshaFunctionalTests.Web.Host, so the framework
    /// behaviour under test -- the authorization filter, Redis caching, NHibernate -- is identical.
    ///
    /// Hangfire is registered as a background-job provider here, but Startup deliberately does not
    /// call AddHangfireServer: the client and storage exist so anything that enqueues a job still
    /// resolves, while no worker runs. Three instances sharing one SQL storage would otherwise
    /// execute scheduled jobs in triplicate and add noise to the measurements.
    /// </summary>
    [DependsOn(
        typeof(SheshaFunctionalTestsWebCoreModule),
        typeof(AbpHangfireAspNetCoreModule))]
    public class CacheTestsWebHostModule : AbpModule
    {
        public override void PreInitialize()
        {
            Configuration.BackgroundJobs.UseHangfire();
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(CacheTestsWebHostModule).GetAssembly());
        }
    }
}
