using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.Modules;
using Castle.MicroKernel.Registration;
using Shesha.Settings.Ioc;
using System.Reflection;

namespace Shesha.Sms.SmsPortal
{
    [DependsOn(typeof(SheshaFrameworkModule), typeof(SheshaApplicationModule), typeof(AbpAspNetCoreModule))]
    public class SheshaSmsPortalModule : AbpModule
    {
        public override void PreInitialize()
        {
            Configuration.Modules.AbpAspNetCore().CreateControllersForAppServices(
                this.GetType().Assembly,
                moduleName: "SheshaSmsPortal",
                useConventionalHttpVerbs: true);
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(Assembly.GetExecutingAssembly());

            IocManager.RegisterSettingAccessor<ISmsPortalSettings>(s => {
                s.Host.WithDefaultValue("mymobileapi.com/api5/http5.aspx");
            });

            IocManager.IocContainer.Register(
                Component.For<ISmsPortalGateway>().Forward<SmsPortalGateway>().ImplementedBy<SmsPortalGateway>().LifestyleTransient()
            );
        }
    }
}
