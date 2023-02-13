using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.Modules;
using Castle.MicroKernel.Registration;
using System.Reflection;

namespace Shesha.Sms.SmsPortal
{
    [DependsOn(typeof(SheshaFrameworkModule), typeof(SheshaApplicationModule), typeof(AbpAspNetCoreModule))]
    public class SheshaSmsPortalModule : AbpModule
    {
        public override void PreInitialize()
        {
            Configuration.Settings.Providers.Add<SmsPortalSettingProvider>();

            Configuration.Modules.AbpAspNetCore().CreateControllersForAppServices(
                this.GetType().Assembly,
                moduleName: "SheshaSmsPortal",
                useConventionalHttpVerbs: true);
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(Assembly.GetExecutingAssembly());

            IocManager.IocContainer.Register(
                Component.For<ISmsPortalGateway>().Forward<SmsPortalGateway>().ImplementedBy<SmsPortalGateway>().LifestyleTransient()
            );
        }
    }
}
