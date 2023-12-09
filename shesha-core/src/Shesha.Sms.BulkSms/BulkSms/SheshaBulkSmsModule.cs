using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.Modules;
using Castle.MicroKernel.Registration;
using Shesha.Modules;
using Shesha.Settings.Ioc;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.Sms.BulkSms
{
    [DependsOn(typeof(SheshaFrameworkModule), typeof(SheshaApplicationModule), typeof(AbpAspNetCoreModule))]
    public class SheshaBulkSmsModule : SheshaModule
    {
        public const string ModuleName = "Shesha.BulkSms";
        public override SheshaModuleInfo ModuleInfo => new SheshaModuleInfo(ModuleName)
        {
            FriendlyName = "Shesha BulkSMS",
            Publisher = "Shesha"
        };

        public override async Task<bool> InitializeConfigurationAsync()
        {
            return await ImportConfigurationAsync();
        }

        public override void PreInitialize()
        {
            Configuration.Modules.AbpAspNetCore().CreateControllersForAppServices(
                this.GetType().Assembly,
                moduleName: "SheshaBulkSms",
                useConventionalHttpVerbs: true);
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(Assembly.GetExecutingAssembly());

            IocManager.RegisterSettingAccessor<IBulkSmsSettings>(s => {
                s.GatewaySettings.WithDefaultValue(new GatewaySettings
                {
                    ApiUrl = "http://bulksms.2way.co.za:5567/eapi/submission/send_sms/2/2.0",
                    UseProxy = false,
                    UseDefaultProxyCredentials = true,
                });
            });

            IocManager.IocContainer.Register(
                Component.For<IBulkSmsGateway>().Forward<BulkSmsGateway>().ImplementedBy<BulkSmsGateway>().LifestyleTransient()
            );
        }
    }
}
