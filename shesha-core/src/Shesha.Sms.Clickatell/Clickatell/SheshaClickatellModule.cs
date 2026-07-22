using Abp.AspNetCore;
using Abp.AspNetCore.Configuration;
using Abp.Modules;
using Castle.MicroKernel.Registration;
using Shesha.Modules;
using Shesha.Settings.Ioc;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.Sms.Clickatell
{
    [DependsOn(typeof(SheshaFrameworkModule), typeof(SheshaApplicationModule), typeof(AbpAspNetCoreModule))]
    public class SheshaClickatellModule : SheshaModule
    {
        public const int DefaultSingleMessageMaxLength = 160;
        public const int DefaultMessagePartLength = 153;

        public const string ModuleName = "Shesha.Clickatell";
        public override SheshaModuleInfo ModuleInfo => new SheshaModuleInfo(ModuleName)
        {
            FriendlyName = "Shesha Clickatell",
            Publisher = "Shesha",
#if !DEBUG
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
                moduleName: "SheshaClickatell",
                useConventionalHttpVerbs: true);
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(Assembly.GetExecutingAssembly());

            IocManager.RegisterSettingAccessor<IClickatellSettings>(s => {
                s.ClickatellGateway.WithDefaultValue(new GatewaySettings
                {
                    Host = "api.clickatell.com",
                    SingleMessageMaxLength = DefaultSingleMessageMaxLength,
                    MessagePartLength = DefaultMessagePartLength
                });
            });

            IocManager.IocContainer.Register(
                Component.For<IClickatellSmsGateway>().Forward<ClickatellSmsGateway>().ImplementedBy<ClickatellSmsGateway>().LifestyleTransient()
            );
        }
    }
}
