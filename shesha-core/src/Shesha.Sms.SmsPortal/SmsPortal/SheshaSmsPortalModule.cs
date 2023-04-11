using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.Modules;
using Castle.MicroKernel.Registration;
using Shesha.Modules;
using Shesha.Settings.Ioc;
using System.Reflection;

namespace Shesha.Sms.SmsPortal
{
    [DependsOn(typeof(SheshaFrameworkModule), typeof(SheshaApplicationModule), typeof(AbpAspNetCoreModule))]
    public class SheshaSmsPortalModule : SheshaModule
    {
        public const string ModuleName = "Shesha.SmsPortal";
        public override SheshaModuleInfo ModuleInfo => new SheshaModuleInfo(ModuleName)
        {
            FriendlyName = "Shesha SMS Portal",
            Publisher = "Boxfusion"
        };

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
                s.GatewaySettings.WithDefaultValue(new GatewaySettings { 
                    Host = "mymobileapi.com/api5/http5.aspx",
                    UseDefaultProxyCredentials = true
                });
            });

            IocManager.IocContainer.Register(
                Component.For<ISmsPortalGateway>().Forward<SmsPortalGateway>().ImplementedBy<SmsPortalGateway>().LifestyleTransient()
            );
        }
    }
}
