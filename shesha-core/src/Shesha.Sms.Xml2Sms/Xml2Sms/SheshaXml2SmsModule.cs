using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.Modules;
using Castle.MicroKernel.Registration;
using Shesha.Modules;
using Shesha.Settings.Ioc;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.Sms.Xml2Sms
{
    [DependsOn(typeof(SheshaFrameworkModule), typeof(SheshaApplicationModule), typeof(AbpAspNetCoreModule))]
    public class SheshaXml2SmsModule : SheshaModule
    {
        public const string ModuleName = "Shesha.Xml2Sms";
        public override SheshaModuleInfo ModuleInfo => new SheshaModuleInfo(ModuleName)
        {
            FriendlyName = "Shesha Xml2Sms",
            Publisher = "Shesha",
#if DisableEditModule
            IsEditable = false,
#endif
        };

        public override async Task<bool> InitializeConfigurationAsync()
        {
            return await ImportConfigurationAsync();
        }

        public override void PreInitialize()
        {
            Configuration.Modules.AbpAspNetCore().CreateControllersForAppServices(
                this.GetType().Assembly,
                moduleName: "SheshaXml2Sms",
                useConventionalHttpVerbs: true);
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(Assembly.GetExecutingAssembly());

            IocManager.RegisterSettingAccessor<IXml2SmsSetting>(settings => {
                settings.GatewaySettings.WithDefaultValue(new GatewaySettings
                {
                    Host = "www.xml2sms.gsm.co.za",
                    UseDefaultProxyCredentials = true
                });
            });

            IocManager.IocContainer.Register(
                Component.For<IXml2SmsGateway>().Forward<Xml2SmsGateway>().ImplementedBy<Xml2SmsGateway>().LifestyleTransient()
            );
        }
    }
}
