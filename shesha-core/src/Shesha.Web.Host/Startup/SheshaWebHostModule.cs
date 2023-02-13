using Abp.Hangfire;
using Abp.Hangfire.Configuration;
using Abp.Modules;
using Abp.Reflection.Extensions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Shesha.Configuration;
using Shesha.GraphQL;
using Shesha.Web.FormsDesigner;

namespace Shesha.Web.Host.Startup
{
    [DependsOn(typeof(SheshaWebCoreModule), 
        typeof(SheshaFormsDesignerModule),
        typeof(AbpHangfireAspNetCoreModule),
        typeof(SheshaGraphQLModule))]
    public class SheshaWebHostModule: AbpModule
    {
        private readonly IHostingEnvironment _env;
        private readonly IConfigurationRoot _appConfiguration;

        public SheshaWebHostModule(IHostingEnvironment env)
        {
            _env = env;
            _appConfiguration = env.GetAppConfiguration();
        }

        public override void PreInitialize()
        {
            base.PreInitialize();
            /*
            Configuration.BackgroundJobs.IsJobExecutionEnabled = false;
            Configuration.Auditing.IsEnabled = false;
            */
            Configuration.BackgroundJobs.UseHangfire();
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(SheshaWebHostModule).GetAssembly());
        }
    }
}
